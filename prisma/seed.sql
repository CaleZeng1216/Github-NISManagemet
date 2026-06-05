-- 护理维保管理系统种子数据

-- 创建管理员 (密码: admin123)
INSERT INTO User (name, email, phone, role, password, createdAt, updatedAt) VALUES
('系统管理员', 'admin@weigao.com', NULL, 'ADMIN', '$2b$10$Ki9mVVXMGNtuMlNUCZTOxe2WO4eRPKlpVbZWPBCoaGXv5zgxrePDO', NOW(), NOW());

-- 创建项目经理 (密码: 123456)
INSERT INTO User (name, email, phone, role, password, createdAt, updatedAt) VALUES
('张三', 'zhangsan@weigao.com', '13800138001', 'PM', '$2b$10$xDh1j3hovaApAIlsz.uPEuSbi5DS9N9/jV5hszEkG2KQhylQ0QLjG', NOW(), NOW());

INSERT INTO User (name, email, phone, role, password, createdAt, updatedAt) VALUES
('李四', 'lisi@weigao.com', '13800138002', 'PM', '$2b$10$xDh1j3hovaApAIlsz.uPEuSbi5DS9N9/jV5hszEkG2KQhylQ0QLjG', NOW(), NOW());

-- 创建示例项目
-- 项目1: 45天后到期 (即将到期)
INSERT INTO Project (name, hospitalName, description, status, warrantyStartDate, warrantyEndDate, managerId, createdAt, updatedAt) VALUES
('市中心医院NIS系统', '市中心医院', '护理信息系统实施项目', 'ACTIVE', '2024-01-15', DATE_ADD(NOW(), INTERVAL 45 DAY), 2, NOW(), NOW());

-- 项目2: 10天前已过期
INSERT INTO Project (name, hospitalName, description, status, warrantyStartDate, warrantyEndDate, managerId, createdAt, updatedAt) VALUES
('省人民医院NIS系统', '省人民医院', '护理信息系统实施项目', 'ACTIVE', '2023-06-01', DATE_ADD(NOW(), INTERVAL -10 DAY), 3, NOW(), NOW());

-- 项目3: 正常（明年到期）
INSERT INTO Project (name, hospitalName, description, status, warrantyStartDate, warrantyEndDate, managerId, createdAt, updatedAt) VALUES
('区第一医院NIS系统', '区第一医院', '护理信息系统实施项目', 'IMPLEMENTING', '2025-01-01', '2026-01-01', 2, NOW(), NOW());

-- 项目4: 75天后到期 (即将到期)
INSERT INTO Project (name, hospitalName, description, status, warrantyStartDate, warrantyEndDate, managerId, createdAt, updatedAt) VALUES
('市第二医院移动护理系统', '市第二医院', NULL, 'ACTIVE', '2023-03-01', DATE_ADD(NOW(), INTERVAL 75 DAY), 3, NOW(), NOW());

-- 创建运维合同 (项目2的续签合同，已过期)
INSERT INTO MaintenanceContract (projectId, contractNo, startDate, endDate, amount, description, status, createdAt) VALUES
(2, 'YW-2024-001', '2024-06-01', '2025-06-01', 120000, '年度运维服务合同', 'EXPIRED', NOW());

-- 创建提醒
INSERT INTO WarrantyAlert (projectId, alertDate, alertType, isRead, createdAt) VALUES
(1, NOW(), 'ONE_MONTH', false, NOW()),
(2, NOW(), 'EXPIRED', false, NOW()),
(4, NOW(), 'THREE_MONTH', false, NOW());