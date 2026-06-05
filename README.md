# 护理维保管理系统

威高医疗集团护理信息系统维保管理平台。

## 功能

- **项目经理管理** — 管理实施项目经理，分配项目
- **项目管理** — 创建/编辑项目，设置免费维保起止日期
- **运维合同** — 签署运维合同，自动延长项目维保期
- **维保到期提醒** — 到期前3个月/1个月自动提醒，已过期标红
- **仪表盘** — 一览维保状态统计和待处理提醒

## 技术栈

- Nuxt 4 + Vue 3 + Nuxt UI (Tailwind CSS)
- Prisma + MySQL 8.0+
- node-cron (定时任务)

## 快速开始

### 1. 配置数据库

修改 `.env` 文件中的 MySQL 连接信息：

```
DATABASE_URL="mysql://root:your_password@localhost:3306/nursing_maintenance"
```

### 2. 创建数据库

```sql
CREATE DATABASE nursing_maintenance CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. 执行数据库迁移

```bash
pnpm db:push
```

### 4. 播种测试数据（可选）

```bash
pnpm db:seed
```

测试账号：
| 角色 | 邮箱 | 密码 |
|------|------|------|
| 管理员 | admin@weigao.com | admin123 |
| 项目经理 | zhangsan@weigao.com | 123456 |
| 项目经理 | lisi@weigao.com | 123456 |

### 5. 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000

## 项目结构

```
├── app/app.vue              # 应用入口
├── pages/                   # 页面
│   ├── index.vue            # 仪表盘
│   ├── login.vue            # 登录页
│   ├── projects/            # 项目管理
│   ├── contracts/           # 运维合同
│   └── users/               # 项目经理管理
├── layouts/                 # 布局
├── composables/             # 组合式函数
├── middleware/              # 路由中间件
├── server/
│   ├── api/                 # API路由
│   │   ├── auth/            # 认证
│   │   ├── users/           # 用户管理
│   │   ├── projects/        # 项目管理
│   │   ├── contracts/       # 运维合同
│   │   ├── alerts/          # 维保提醒
│   │   └── dashboard/       # 仪表盘
│   ├── utils/               # 服务端工具
│   │   ├── prisma.ts        # 数据库客户端
│   │   ├── auth.ts          # 认证工具
│   │   └── warranty.ts      # 维保计算逻辑
│   ├── tasks/               # 定时任务
│   └── plugins/             # Nitro插件
├── prisma/
│   ├── schema.prisma        # 数据模型
│   └── seed.js              # 测试数据
└── types/                   # TypeScript类型
```

## 维保提醒规则

| 距离到期 | 提醒类型 | 状态色标 |
|----------|----------|----------|
| > 90天 | 无提醒 | 🟢 正常 |
| 31-90天 | 3个月提醒 | 🟡 即将到期 |
| 1-30天 | 1个月提醒 | 🟠 即将到期 |
| 已过期 | 过期提醒 | 🔴 已过期 |

## 运维合同自动延长维保

签署运维合同时，如果合同的截止日期晚于项目的当前维保截止日期，系统会自动将项目维保截止日期更新为合同截止日期。
