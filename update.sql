-- update add otp fields.sql
ALTER TABLE `User` 
ADD COLUMN `verification_code` VARCHAR(255) DEFAULT NULL,
ADD COLUMN `code_expires_at` TIMESTAMP NULL DEFAULT NULL;

-- update add deadline to Job_Posting
ALTER TABLE `Job_Posting`
ADD COLUMN `deadline` DATE DEFAULT NULL AFTER `job_type`;

Cấu trúc bảng cho bảng `transaction`
--

CREATE TABLE `transaction` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `amount_fiat` decimal(10,2) DEFAULT 0.00,
  `coins` int(11) NOT NULL,
  `type` enum('deposit','purchase','refund') NOT NULL,
  `payment_method` varchar(50) DEFAULT 'bank_transfer',
  `status` enum('pending','completed','failed') DEFAULT 'pending',
  `reference_code` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `transaction`
--

INSERT INTO `transaction` (`id`, `user_id`, `amount_fiat`, `coins`, `type`, `payment_method`, `status`, `reference_code`, `created_at`) VALUES
(1, 5, 200000.00, 200, 'deposit', 'bank_transfer', 'failed', 'NAPXU_TEST_NGHIA_01', '2026-06-01 06:47:44'),
(2, 6, 500000.00, 500, 'deposit', 'bank_transfer', 'completed', 'NAPXU_TEST_HR_02', '2026-06-01 06:47:44'),
(3, 5, 100000.00, 100, 'deposit', 'bank_transfer', 'completed', 'LS_DA_DUYET_03', '2026-06-01 06:47:44');