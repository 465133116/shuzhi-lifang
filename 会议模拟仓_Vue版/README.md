# 业主会议模拟仓 (Vue 版)

该模块为业主会议提供会前模拟环境，支持“主持人”与“普通参与者”双视角实时切换。

## 目录结构
- `components/` - Vue组件(SimulateRoom, PrepareRoom, MeetingRoom, RoleToggle)
- `mock/` - JSON数据(人员、议程、投票)
- `store/` - Pinia状态管理
- `tests/` - 单元测试与E2E测试

## 运行与验证指令

1. **运行 Mock 服务**
使用 `json-server` (或将 mock 文件夹置于 public 目录下):
```bash
npx json-server --watch mock/simulateMembers.json --port 3004
```

2. **启动模拟仓**
由于这是 Vue 组件，需在您的 Vue 项目中挂载或使用 Vite 快速启动：
```bash
# 进入包含 Vue 组件的项目根目录
npm run dev
# 或使用 Vite 直接预览
npx vite
```

3. **切换角色与验证视角差异**
- **通过 UI 切换**：点击左上角“主持人视角”/“参与者视角”按钮，界面将在 300ms 内完成切换。
- **通过 URL 切换**：在地址栏附加参数 `?role=host` 或 `?role=participant` 强制初始化为对应视角。
- **差异验证**：
  - 主持人进入“正式会议”后，顶部有操作栏，侧边栏有全体静音/成员管理。
  - 参与者进入后，只有举手和投票，无管理权限。

4. **运行测试**
```bash
# 运行单元测试
npm run test:unit
# 运行 E2E 测试 (基于 Cypress/Playwright)
npm run test:e2e
```
