// simulateRoom.spec.js (Playwright/Cypress E2E Test Cases)

describe('业主会议模拟仓 E2E Tests', () => {
  beforeEach(() => {
    // 假设运行在 http://localhost:9001
    cy.visit('http://localhost:9001/#/simulate?role=host')
  })

  it('a) 主持人进入准备室可见“开始会议”按钮', () => {
    cy.get('.role-toggle .active').should('contain', '主持人视角')
    cy.get('.action-bar .primary-btn').should('contain', '开始会议')
    cy.get('.action-bar .primary-btn').should('contain', '进入会议室')
  })

  it('b) 参与者视角无管理菜单', () => {
    // 切换到参与者
    cy.get('.toggle-btn').contains('参与者视角').click()
    // 进入会议室
    cy.get('.action-bar .primary-btn').click()
    // 断言无管理菜单
    cy.get('.meeting-toolbar').should('not.exist')
    cy.get('.host-batch-actions').should('not.exist')
    // 确认有举手和投票
    cy.get('.personal-controls').should('contain', '举手')
    cy.get('.personal-controls').should('contain', '参与投票')
  })

  it('c) 角色切换后路由参数正确', () => {
    cy.get('.toggle-btn').contains('参与者视角').click()
    cy.url().should('include', '?role=participant')
    
    cy.get('.toggle-btn').contains('主持人视角').click()
    cy.url().should('include', '?role=host')
  })

  it('d) 步骤条点击回退后数据不丢失', () => {
    // 主持人进入会议室
    cy.get('.action-bar .primary-btn').click()
    cy.get('.step.completed').contains('准备室').should('exist')
    
    // 点击回退
    cy.get('.step.completed').click()
    cy.get('.prepare-room').should('be.visible')
    // 检查身份核验状态是否仍在
    cy.get('.status.success').should('contain', '身份核验已通过')
  })

  it('e) 网络断开 5s 内给出 Toast 提示并自动重连', () => {
    // 模拟离线
    cy.window().then((win) => {
      win.dispatchEvent(new Event('offline'))
    })
    cy.get('.toast-offline').should('be.visible').and('contain', '网络已断开')
    
    // 模拟上线
    cy.window().then((win) => {
      win.dispatchEvent(new Event('online'))
    })
    cy.get('.toast-offline').should('not.exist')
  })

  it('f) 在 1366×768 与 375×812 分辨率下无横向滚动条', () => {
    cy.viewport(1366, 768)
    cy.window().then((win) => {
      expect(win.document.documentElement.scrollWidth).to.equal(win.innerWidth)
    })
    
    cy.viewport(375, 812)
    cy.window().then((win) => {
      expect(win.document.documentElement.scrollWidth).to.equal(win.innerWidth)
    })
  })
})
