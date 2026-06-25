const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 1. Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads/posts');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 2. Configure Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// 3. File filter (Strict validation for images and videos)
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedVideoTypes = /mp4|mov|avi|mkv|webm/;

  const mimeType = file.mimetype;
  const extName = path.extname(file.originalname).toLowerCase();

  const isImage = allowedImageTypes.test(mimeType) || allowedImageTypes.test(extName);
  const isVideo = allowedVideoTypes.test(mimeType) || allowedVideoTypes.test(extName);

  if (isImage || isVideo) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only images and videos are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // Limit to 50MB (especially for videos)
});

// Middleware to handle Multer upload and filter errors gracefully
const uploadMiddleware = (req, res, next) => {
  upload.array('media', 10)(req, res, (err) => {
    if (err) {
      try {
        const logPath = path.join(__dirname, '../../error.log');
        fs.appendFileSync(
          logPath,
          `[${new Date().toISOString()}] Upload Error: ${err.message}\nStack: ${err.stack || ''}\n\n`
        );
      } catch (logErr) {
        console.error('Failed to write upload error log:', logErr);
      }
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

// Helper function to fetch and map multiple media attachments for posts (avoids N+1)
const fetchPostMedia = async (posts) => {
  if (!posts || posts.length === 0) return posts;
  
  const postIds = posts.map(p => p.id);
  const [mediaRows] = await pool.query(
    'SELECT post_id, media_url, media_type FROM Post_Media WHERE post_id IN (?)',
    [postIds]
  );
  
  const mediaMap = {};
  mediaRows.forEach(row => {
    if (!mediaMap[row.post_id]) {
      mediaMap[row.post_id] = [];
    }
    mediaMap[row.post_id].push({
      media_url: row.media_url,
      media_type: row.media_type
    });
  });
  
  return posts.map(post => {
    let media = mediaMap[post.id] || [];
    // Fallback compatibility for legacy posts that only have media_url in Community_Post table
    if (media.length === 0 && post.media_url) {
      media = [{
        media_url: post.media_url,
        media_type: post.media_type
      }];
    }
    return {
      ...post,
      mediaList: media
    };
  });
};

// GET /api/posts - Get all community posts
router.get('/', async (req, res) => {
  try {
    // Determine user_id if logged in (extract from token if present, otherwise null)
    let currentUserId = null;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'SECRET_KEY');
        currentUserId = decoded.id;
      } catch (err) {
        // Ignore invalid token, treat as guest
      }
    }

    const [posts] = await pool.query(
      `SELECT 
          p.*,
          u.role AS user_role,
          com.id AS company_id,
          CASE 
              WHEN u.role IN ('candidate', 'Candidate') THEN cp.full_name 
              WHEN u.role IN ('company', 'HR') THEN com.name
              ELSE 'System User'
          END AS author_name,
          CASE 
              WHEN u.role IN ('candidate', 'Candidate') THEN cp.avatar_url 
              WHEN u.role IN ('company', 'HR') THEN com.logo_url
              ELSE NULL
          END AS author_avatar,
          CASE
              WHEN u.role IN ('candidate', 'Candidate') THEN cp.headline
              WHEN u.role IN ('company', 'HR') THEN NULL
              ELSE ''
          END AS author_title,
          (SELECT COUNT(*) FROM Post_Like WHERE post_id = p.id) AS likes_count,
          (SELECT COUNT(*) FROM Post_Comment WHERE post_id = p.id) AS comments_count,
          (SELECT COUNT(*) FROM Community_Post WHERE parent_post_id = p.id) AS reposts_count,
          EXISTS(SELECT 1 FROM Post_Like WHERE post_id = p.id AND user_id = ?) AS is_liked,
          
          -- Parent post fields (for reposts)
          parent.content AS parent_content,
          parent.media_url AS parent_media_url,
          parent.media_type AS parent_media_type,
          parent.created_at AS parent_created_at,
          parent_u.id AS parent_author_id,
          parent_u.role AS parent_user_role,
          parent_com.id AS parent_company_id,
          CASE 
              WHEN parent_u.role IN ('candidate', 'Candidate') THEN parent_cp.full_name 
              WHEN parent_u.role IN ('company', 'HR') THEN parent_com.name
              ELSE 'System User'
          END AS parent_author_name,
          CASE 
              WHEN parent_u.role IN ('candidate', 'Candidate') THEN parent_cp.avatar_url 
              WHEN parent_u.role IN ('company', 'HR') THEN parent_com.logo_url
              ELSE NULL
          END AS parent_author_avatar,
          CASE
              WHEN parent_u.role IN ('candidate', 'Candidate') THEN parent_cp.headline
              WHEN parent_u.role IN ('company', 'HR') THEN NULL
              ELSE ''
          END AS parent_author_title
      FROM Community_Post p
      JOIN User u ON p.user_id = u.id
      LEFT JOIN Candidate_Profile cp ON u.id = cp.user_id
      LEFT JOIN Company com ON u.id = com.hr_id
      LEFT JOIN Community_Post parent ON p.parent_post_id = parent.id
      LEFT JOIN User parent_u ON parent.parent_post_id IS NULL AND parent.user_id = parent_u.id
      LEFT JOIN Candidate_Profile parent_cp ON parent_u.id = parent_cp.user_id
      LEFT JOIN Company parent_com ON parent_u.id = parent_com.hr_id
      ORDER BY p.created_at DESC`,
      [currentUserId]
    );

    const postsWithMedia = await fetchPostMedia(posts);
    res.json(postsWithMedia);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/posts/user/:user_id - Get posts by a specific user (for profile page)
router.get('/user/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    let currentUserId = null;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'SECRET_KEY');
        currentUserId = decoded.id;
      } catch (err) {
        // Ignore
      }
    }

    const [posts] = await pool.query(
      `SELECT 
          p.*,
          u.role AS user_role,
          com.id AS company_id,
          CASE 
              WHEN u.role IN ('candidate', 'Candidate') THEN cp.full_name 
              WHEN u.role IN ('company', 'HR') THEN com.name
              ELSE 'System User'
          END AS author_name,
          CASE 
              WHEN u.role IN ('candidate', 'Candidate') THEN cp.avatar_url 
              WHEN u.role IN ('company', 'HR') THEN com.logo_url
              ELSE NULL
          END AS author_avatar,
          CASE
              WHEN u.role IN ('candidate', 'Candidate') THEN cp.headline
              WHEN u.role IN ('company', 'HR') THEN NULL
              ELSE ''
          END AS author_title,
          (SELECT COUNT(*) FROM Post_Like WHERE post_id = p.id) AS likes_count,
          (SELECT COUNT(*) FROM Post_Comment WHERE post_id = p.id) AS comments_count,
          (SELECT COUNT(*) FROM Community_Post WHERE parent_post_id = p.id) AS reposts_count,
          EXISTS(SELECT 1 FROM Post_Like WHERE post_id = p.id AND user_id = ?) AS is_liked,
          
          -- Parent post fields
          parent.content AS parent_content,
          parent.media_url AS parent_media_url,
          parent.media_type AS parent_media_type,
          parent.created_at AS parent_created_at,
          parent_u.id AS parent_author_id,
          parent_u.role AS parent_user_role,
          parent_com.id AS parent_company_id,
          CASE 
              WHEN parent_u.role IN ('candidate', 'Candidate') THEN parent_cp.full_name 
              WHEN parent_u.role IN ('company', 'HR') THEN parent_com.name
              ELSE 'System User'
          END AS parent_author_name,
          CASE 
              WHEN parent_u.role IN ('candidate', 'Candidate') THEN parent_cp.avatar_url 
              WHEN parent_u.role IN ('company', 'HR') THEN parent_com.logo_url
              ELSE NULL
          END AS parent_author_avatar,
          CASE
              WHEN parent_u.role IN ('candidate', 'Candidate') THEN parent_cp.headline
              WHEN parent_u.role IN ('company', 'HR') THEN NULL
              ELSE ''
          END AS parent_author_title
      FROM Community_Post p
      JOIN User u ON p.user_id = u.id
      LEFT JOIN Candidate_Profile cp ON u.id = cp.user_id
      LEFT JOIN Company com ON u.id = com.hr_id
      LEFT JOIN Community_Post parent ON p.parent_post_id = parent.id
      LEFT JOIN User parent_u ON parent.user_id = parent_u.id
      LEFT JOIN Candidate_Profile parent_cp ON parent_u.id = parent_cp.user_id
      LEFT JOIN Company parent_com ON parent_u.id = parent_com.hr_id
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC`,
      [currentUserId, user_id]
    );

    const postsWithMedia = await fetchPostMedia(posts);
    res.json(postsWithMedia);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/posts/activity/history - Get activity history (likes, comments, shares) of the current user
router.get('/activity/history', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  try {
    // 1. Get liked posts
    const [likes] = await pool.query(
      `SELECT 
          pl.post_id AS id,
          pl.created_at AS liked_at,
          p.content,
          CASE 
              WHEN u.role IN ('candidate', 'Candidate') THEN cp.full_name 
              WHEN u.role IN ('company', 'HR') THEN com.name
              ELSE 'System User'
          END AS author,
          CASE 
              WHEN u.role IN ('candidate', 'Candidate') THEN cp.avatar_url 
              WHEN u.role IN ('company', 'HR') THEN com.logo_url
              ELSE NULL
          END AS avatar
      FROM Post_Like pl
      JOIN Community_Post p ON pl.post_id = p.id
      JOIN User u ON p.user_id = u.id
      LEFT JOIN Candidate_Profile cp ON u.id = cp.user_id
      LEFT JOIN Company com ON u.id = com.hr_id
      WHERE pl.user_id = ?
      ORDER BY pl.created_at DESC`,
      [userId]
    );

    // 2. Get comments
    const [comments] = await pool.query(
      `SELECT 
          c.id,
          c.post_id,
          c.content AS comment,
          c.created_at AS commented_at,
          p.content AS content,
          CASE 
              WHEN p_u.role IN ('candidate', 'Candidate') THEN p_cp.full_name 
              WHEN p_u.role IN ('company', 'HR') THEN p_com.name
              ELSE 'System User'
          END AS author,
          CASE 
              WHEN p_u.role IN ('candidate', 'Candidate') THEN p_cp.avatar_url 
              WHEN p_u.role IN ('company', 'HR') THEN p_com.logo_url
              ELSE NULL
          END AS avatar
      FROM Post_Comment c
      JOIN Community_Post p ON c.post_id = p.id
      JOIN User p_u ON p.user_id = p_u.id
      LEFT JOIN Candidate_Profile p_cp ON p_u.id = p_cp.user_id
      LEFT JOIN Company p_com ON p_u.id = p_com.hr_id
      WHERE c.user_id = ?
      ORDER BY c.created_at DESC`,
      [userId]
    );

    // 3. Get shared posts
    const [shares] = await pool.query(
      `SELECT 
          p.id,
          p.content AS message,
          p.created_at AS shared_at,
          parent.content AS content,
          CASE 
              WHEN parent_u.role IN ('candidate', 'Candidate') THEN parent_cp.full_name 
              WHEN parent_u.role IN ('company', 'HR') THEN parent_com.name
              ELSE 'System User'
          END AS author,
          CASE 
              WHEN parent_u.role IN ('candidate', 'Candidate') THEN parent_cp.avatar_url 
              WHEN parent_u.role IN ('company', 'HR') THEN parent_com.logo_url
              ELSE NULL
          END AS avatar
      FROM Community_Post p
      JOIN Community_Post parent ON p.parent_post_id = parent.id
      JOIN User parent_u ON parent.user_id = parent_u.id
      LEFT JOIN Candidate_Profile parent_cp ON parent_u.id = parent_cp.user_id
      LEFT JOIN Company parent_com ON parent_u.id = parent_com.hr_id
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC`,
      [userId]
    );

    res.json({
      likes,
      comments,
      shares
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/posts/comments/:commentId - Delete a comment
router.delete('/comments/:commentId', authMiddleware, async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check comment ownership
    const [comments] = await pool.query('SELECT user_id FROM Post_Comment WHERE id = ?', [commentId]);
    if (comments.length === 0) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comments[0].user_id !== userId && userRole !== 'Admin') {
      return res.status(403).json({ message: 'Unauthorized. You can only delete your own comments.' });
    }

    await pool.query('DELETE FROM Post_Comment WHERE id = ?', [commentId]);
    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/posts/comments/:commentId - Edit a comment
router.put('/comments/:commentId', authMiddleware, async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    // Check comment ownership
    const [comments] = await pool.query('SELECT user_id FROM Post_Comment WHERE id = ?', [commentId]);
    if (comments.length === 0) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comments[0].user_id !== userId) {
      return res.status(403).json({ message: 'Unauthorized. You can only edit your own comments.' });
    }

    await pool.query('UPDATE Post_Comment SET content = ? WHERE id = ?', [content.trim(), commentId]);
    res.json({ message: 'Comment updated successfully', content: content.trim() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// POST /api/posts - Create a new post
router.post('/', authMiddleware, uploadMiddleware, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { content } = req.body;
    const userId = req.user.id;

    // First file as fallback for Community_Post table (legacy compatibility)
    let firstMediaUrl = null;
    let firstMediaType = null;
    const mediaFiles = req.files || [];

    if (mediaFiles.length > 0) {
      firstMediaUrl = `/uploads/posts/${mediaFiles[0].filename}`;
      const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
      firstMediaType = allowedImageTypes.test(mediaFiles[0].mimetype) ? 'image' : 'video';
    }

    if (!content && mediaFiles.length === 0) {
      connection.release();
      return res.status(400).json({ message: 'Post content or media is required' });
    }

    // 1. Insert into Community_Post
    const [result] = await connection.query(
      `INSERT INTO Community_Post (user_id, content, media_url, media_type)
       VALUES (?, ?, ?, ?)`,
      [userId, content || null, firstMediaUrl, firstMediaType]
    );

    const postId = result.insertId;

    // 2. Insert all media attachments into Post_Media
    const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
    for (const file of mediaFiles) {
      const mediaUrl = `/uploads/posts/${file.filename}`;
      const mediaType = allowedImageTypes.test(file.mimetype) ? 'image' : 'video';
      await connection.query(
        `INSERT INTO Post_Media (post_id, media_url, media_type) VALUES (?, ?, ?)`,
        [postId, mediaUrl, mediaType]
      );
    }

    await connection.commit();
    connection.release();

    // 3. Select the newly created post
    const [newPost] = await pool.query(
      `SELECT 
          p.*,
          u.role AS user_role,
          com.id AS company_id,
          CASE 
              WHEN u.role IN ('candidate', 'Candidate') THEN cp.full_name 
              WHEN u.role IN ('company', 'HR') THEN com.name
              ELSE 'System User'
          END AS author_name,
          CASE 
              WHEN u.role IN ('candidate', 'Candidate') THEN cp.avatar_url 
              WHEN u.role IN ('company', 'HR') THEN com.logo_url
              ELSE NULL
          END AS author_avatar,
          CASE
              WHEN u.role IN ('candidate', 'Candidate') THEN cp.headline
              WHEN u.role IN ('company', 'HR') THEN NULL
              ELSE ''
          END AS author_title,
          0 AS likes_count,
          0 AS comments_count,
          0 AS reposts_count,
          0 AS is_liked
      FROM Community_Post p
      JOIN User u ON p.user_id = u.id
      LEFT JOIN Candidate_Profile cp ON u.id = cp.user_id
      LEFT JOIN Company com ON u.id = com.hr_id
      WHERE p.id = ?`,
      [postId]
    );

    const postsWithMedia = await fetchPostMedia(newPost);
    res.status(201).json({ message: 'Post created successfully', post: postsWithMedia[0] });
  } catch (err) {
    await connection.rollback();
    connection.release();
    console.error(err);
    try {
      const logPath = path.join(__dirname, '../../error.log');
      fs.appendFileSync(
        logPath,
        `[${new Date().toISOString()}] POST /api/posts Database/Logic Error: ${err.message}\n` +
        `Stack: ${err.stack || ''}\n` +
        `Request User: ${JSON.stringify(req.user || {})}\n` +
        `Request Body: ${JSON.stringify(req.body || {})}\n` +
        `Request Files: ${JSON.stringify(req.files || [])}\n\n`
      );
    } catch (logErr) {
      console.error('Failed to write post error log:', logErr);
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/posts/:id/like - Like or unlike a post
router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if post exists
    const [posts] = await pool.query('SELECT id FROM Community_Post WHERE id = ?', [id]);
    if (posts.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if already liked
    const [existing] = await pool.query(
      'SELECT * FROM Post_Like WHERE post_id = ? AND user_id = ?',
      [id, userId]
    );

    let liked = false;
    if (existing.length > 0) {
      // Unlike
      await pool.query('DELETE FROM Post_Like WHERE post_id = ? AND user_id = ?', [id, userId]);
    } else {
      // Like
      await pool.query('INSERT INTO Post_Like (post_id, user_id) VALUES (?, ?)', [id, userId]);
      liked = true;
    }

    const [likesCount] = await pool.query(
      'SELECT COUNT(*) AS count FROM Post_Like WHERE post_id = ?',
      [id]
    );

    res.json({ message: liked ? 'Post liked' : 'Post unliked', is_liked: liked, likes_count: likesCount[0].count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/posts/:id/comments - Get comments of a post
router.get('/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;

    // Determine user_id if logged in (extract from token if present, otherwise null)
    let currentUserId = null;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'SECRET_KEY');
        currentUserId = decoded.id;
      } catch (err) {
        // Ignore
      }
    }

    const [comments] = await pool.query(
      `SELECT 
          c.*,
          u.role AS user_role,
          com.id AS company_id,
          CASE 
              WHEN u.role IN ('candidate', 'Candidate') THEN cp.full_name 
              WHEN u.role IN ('company', 'HR') THEN com.name
              ELSE 'System User'
          END AS author_name,
          CASE 
              WHEN u.role IN ('candidate', 'Candidate') THEN cp.avatar_url 
              WHEN u.role IN ('company', 'HR') THEN com.logo_url
              ELSE NULL
          END AS author_avatar,
          (SELECT COUNT(*) FROM Comment_Like WHERE comment_id = c.id) AS likes_count,
          EXISTS(SELECT 1 FROM Comment_Like WHERE comment_id = c.id AND user_id = ?) AS is_liked
      FROM Post_Comment c
      JOIN User u ON c.user_id = u.id
      LEFT JOIN Candidate_Profile cp ON u.id = cp.user_id
      LEFT JOIN Company com ON u.id = com.hr_id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC`,
      [currentUserId, id]
    );

    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/posts/:id/comments - Comment on a post
router.post('/:id/comments', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { content, parent_comment_id } = req.body;
    const userId = req.user.id;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    // Check if post exists
    const [posts] = await pool.query('SELECT id FROM Community_Post WHERE id = ?', [id]);
    if (posts.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const [result] = await pool.query(
      'INSERT INTO Post_Comment (post_id, user_id, content, parent_comment_id) VALUES (?, ?, ?, ?)',
      [id, userId, content.trim(), parent_comment_id || null]
    );

    const [newComment] = await pool.query(
      `SELECT 
          c.*,
          u.role AS user_role,
          com.id AS company_id,
          CASE 
              WHEN u.role IN ('candidate', 'Candidate') THEN cp.full_name 
              WHEN u.role IN ('company', 'HR') THEN com.name
              ELSE 'System User'
          END AS author_name,
          CASE 
              WHEN u.role IN ('candidate', 'Candidate') THEN cp.avatar_url 
              WHEN u.role IN ('company', 'HR') THEN com.logo_url
              ELSE NULL
          END AS author_avatar,
          0 AS likes_count,
          0 AS is_liked
      FROM Post_Comment c
      JOIN User u ON c.user_id = u.id
      LEFT JOIN Candidate_Profile cp ON u.id = cp.user_id
      LEFT JOIN Company com ON u.id = com.hr_id
      WHERE c.id = ?`,
      [result.insertId]
    );

    res.status(201).json({ message: 'Comment added successfully', comment: newComment[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/posts/comments/:commentId/like - Like or unlike a comment
router.post('/comments/:commentId/like', authMiddleware, async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    // Check if comment exists
    const [comments] = await pool.query('SELECT id FROM Post_Comment WHERE id = ?', [commentId]);
    if (comments.length === 0) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if already liked
    const [existing] = await pool.query(
      'SELECT * FROM Comment_Like WHERE comment_id = ? AND user_id = ?',
      [commentId, userId]
    );

    let liked = false;
    if (existing.length > 0) {
      // Unlike
      await pool.query('DELETE FROM Comment_Like WHERE comment_id = ? AND user_id = ?', [commentId, userId]);
    } else {
      // Like
      await pool.query('INSERT INTO Comment_Like (comment_id, user_id) VALUES (?, ?)', [commentId, userId]);
      liked = true;
    }

    const [likesCount] = await pool.query(
      'SELECT COUNT(*) AS count FROM Comment_Like WHERE comment_id = ?',
      [commentId]
    );

    res.json({ 
      message: liked ? 'Comment liked' : 'Comment unliked', 
      is_liked: liked, 
      likes_count: likesCount[0].count 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/posts/:id/repost - Repost/Share a post
router.post('/:id/repost', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body; // Optional comment from the user who is sharing
    const userId = req.user.id;

    // Check if original post exists
    const [posts] = await pool.query('SELECT id, parent_post_id FROM Community_Post WHERE id = ?', [id]);
    if (posts.length === 0) {
      return res.status(404).json({ message: 'Original post not found' });
    }

    // Determine the post to refer (always refer to the original post to avoid nesting levels)
    const targetPostId = posts[0].parent_post_id || posts[0].id;

    const [result] = await pool.query(
      `INSERT INTO Community_Post (user_id, content, parent_post_id)
       VALUES (?, ?, ?)`,
      [userId, content || null, targetPostId]
    );

    const [newPost] = await pool.query(
      `SELECT 
          p.*,
          u.role AS user_role,
          CASE 
              WHEN u.role IN ('candidate', 'Candidate') THEN cp.full_name 
              WHEN u.role IN ('company', 'HR') THEN com.name
              ELSE 'System User'
          END AS author_name,
          CASE 
              WHEN u.role IN ('candidate', 'Candidate') THEN cp.avatar_url 
              WHEN u.role IN ('company', 'HR') THEN com.logo_url
              ELSE NULL
          END AS author_avatar,
          CASE
              WHEN u.role IN ('candidate', 'Candidate') THEN cp.headline
              WHEN u.role IN ('company', 'HR') THEN NULL
              ELSE ''
          END AS author_title,
          0 AS likes_count,
          0 AS comments_count,
          0 AS reposts_count,
          0 AS is_liked,
          
          -- Parent post fields
          parent.content AS parent_content,
          parent.media_url AS parent_media_url,
          parent.media_type AS parent_media_type,
          parent.created_at AS parent_created_at,
          parent_u.id AS parent_author_id,
          parent_u.role AS parent_user_role,
          CASE 
              WHEN parent_u.role IN ('candidate', 'Candidate') THEN parent_cp.full_name 
              WHEN parent_u.role IN ('company', 'HR') THEN parent_com.name
              ELSE 'System User'
          END AS parent_author_name,
          CASE 
              WHEN parent_u.role IN ('candidate', 'Candidate') THEN parent_cp.avatar_url 
              WHEN parent_u.role IN ('company', 'HR') THEN parent_com.logo_url
              ELSE NULL
          END AS parent_author_avatar,
          CASE
              WHEN parent_u.role IN ('candidate', 'Candidate') THEN parent_cp.headline
              WHEN parent_u.role IN ('company', 'HR') THEN NULL
              ELSE ''
          END AS parent_author_title
      FROM Community_Post p
      JOIN User u ON p.user_id = u.id
      LEFT JOIN Candidate_Profile cp ON u.id = cp.user_id
      LEFT JOIN Company com ON u.id = com.hr_id
      LEFT JOIN Community_Post parent ON p.parent_post_id = parent.id
      LEFT JOIN User parent_u ON parent.user_id = parent_u.id
      LEFT JOIN Candidate_Profile parent_cp ON parent_u.id = parent_cp.user_id
      LEFT JOIN Company parent_com ON parent_u.id = parent_com.hr_id
      WHERE p.id = ?`,
      [result.insertId]
    );

    res.status(201).json({ message: 'Post shared successfully', post: newPost[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/posts/:id - Delete a post
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check post ownership
    const [posts] = await pool.query('SELECT user_id FROM Community_Post WHERE id = ?', [id]);
    if (posts.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (posts[0].user_id !== userId && userRole !== 'Admin') {
      return res.status(403).json({ message: 'Unauthorized. You can only delete your own posts.' });
    }

    // Fetch and delete all media files associated with the post from disk
    const [mediaList] = await pool.query('SELECT media_url FROM Post_Media WHERE post_id = ?', [id]);
    for (const media of mediaList) {
      if (media.media_url) {
        const filePath = path.join(__dirname, '../..', media.media_url);
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (err) {
            console.error(`Failed to delete media file: ${filePath}`, err);
          }
        }
      }
    }

    await pool.query('DELETE FROM Community_Post WHERE id = ?', [id]);
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
