import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import SimulateRoom from '../../components/SimulateRoom.vue'
import RoleToggle from '../../components/RoleToggle.vue'
import { useSimulationStore } from '../../store'

vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({ query: { role: 'host' } })),
  useRouter: vi.fn(() => ({ replace: vi.fn() }))
}))

describe('SimulateRoom.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    // 模拟 console.log 捕获埋点
    vi.spyOn(console, 'log')
  })

  it('renders correctly and shows modal initially', () => {
    const wrapper = mount(SimulateRoom)
    expect(wrapper.find('h2').text()).toBe('业主会议模拟仓')
    // 弹窗默认显示
    expect(wrapper.find('.phase-modal-overlay').exists()).toBe(true)
    expect(wrapper.find('.phase-modal-title').text()).toBe('请选择进入模拟仓的阶段')
  })

  it('syncs role toggle with store', async () => {
    const store = useSimulationStore()
    const wrapper = mount(SimulateRoom)
    
    const roleToggle = wrapper.findComponent(RoleToggle)
    await roleToggle.vm.$emit('update:modelValue', 'committee')
    
    expect(store.currentRole).toBe('committee')
  })

  it('selects phase and closes modal', async () => {
    vi.useFakeTimers()
    const wrapper = mount(SimulateRoom, {
      global: {
        stubs: {
          transition: false
        }
      }
    })
    
    // 找到所有的 phase-card
    const phaseCards = wrapper.findAll('.phase-card')
    expect(phaseCards.length).toBe(3)

    // 模拟点击“会中（线上会议）”选项
    await phaseCards[1].trigger('click')

    // 验证埋点发送
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('[Tracking] User selected phase: meeting'))

    // Vue更新DOM
    await wrapper.vm.$nextTick()
    // 由于使用了 transition，可能需要运行一下 timer
    vi.runAllTimers()
    await wrapper.vm.$nextTick()

    // 验证弹窗淡出（v-if 变成 false）
    expect(wrapper.find('.phase-modal-overlay').exists()).toBe(false)
    
    // 验证当前组件切换为 MeetingRoom (通过 DOM 类名判断)
    expect(wrapper.find('.meeting-room').exists()).toBe(true)
    
    vi.useRealTimers()
  })
})
