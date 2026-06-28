const express = require('express');
const router = express.Router();
const pool = require('../config/db');


// GET /api/industries/categories
router.get('/categories', async (req, res) => {
    try {
        // Đã sửa db.query thành pool.query
        const [rows] = await pool.query('SELECT id, name FROM industry_category ORDER BY name ASC');
        res.status(200).json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error("Categories Error:", error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// GET /api/industries (Đã gộp 2 route '/' làm 1 để tránh lỗi)
router.get('/', async (req, res) => {
    try {
        const { categoryIds } = req.query;

        if (!categoryIds) {
            const [rows] = await pool.query('SELECT id, name, category_id FROM industry ORDER BY name ASC');
            return res.status(200).json({ success: true, data: rows });
        }

        const ids = categoryIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));

        if (ids.length === 0) {
            return res.status(200).json({ success: true, data: [] });
        }

        const [rows] = await pool.query('SELECT id, name, category_id FROM industry WHERE category_id IN (?) ORDER BY name ASC', [ids]);
        
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Industry Error:", error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// GET /api/industries/skills
router.get('/skills', async (req, res) => {
    try {
        const { industryIds } = req.query;

        if (!industryIds) {
            const [rows] = await pool.query('SELECT id, skill_name FROM skill ORDER BY skill_name ASC');
            return res.status(200).json({ success: true, data: rows });
        }

        const ids = industryIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));

        if (ids.length === 0) {
            return res.status(200).json({ success: true, data: [] });
        }

        const query = `
            SELECT DISTINCT s.id, s.skill_name 
            FROM skill s
            JOIN industry_skill isk ON s.id = isk.skill_id
            WHERE isk.industry_id IN (?)
            ORDER BY s.skill_name ASC
        `;
        
        const [rows] = await pool.query(query, [ids]);
        
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Skills Error:", error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});
router.get('/search-titles', async (req, res) => {
    try {
        const keyword = req.query.q;
        
        if (!keyword) {
            return res.json({ success: true, data: [] });
        }

        const query = `
            SELECT title 
            FROM job_title_dictionary 
            WHERE title LIKE ? 
            LIMIT 10
        `;
        
        const [rows] = await pool.query(query, [`%${keyword}%`]);
        const titles = rows.map(row => row.title);
        
        res.json({ success: true, data: titles });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

module.exports = router;