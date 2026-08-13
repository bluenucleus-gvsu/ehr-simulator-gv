import { describe, expect, it } from 'vitest'
import { convert12HourTo24Hour, display12HourValue } from '@/components/ui/time-picker-utils'

describe('time-picker-utils date helpers', () => {
  describe('convert12HourTo24Hour', () => {
    it('converts 12 AM to 0 hours', () => {
      expect(convert12HourTo24Hour(12, 'AM')).toBe(0)
    })

    it('keeps 12 PM as 12 hours', () => {
      expect(convert12HourTo24Hour(12, 'PM')).toBe(12)
    })

    it('converts 1 PM to 13 hours', () => {
      expect(convert12HourTo24Hour(1, 'PM')).toBe(13)
    })

    it('keeps 11 AM as 11 hours', () => {
      expect(convert12HourTo24Hour(11, 'AM')).toBe(11)
    })
  })

  describe('display12HourValue', () => {
    it('shows 0 as 12', () => {
      expect(display12HourValue(0)).toBe('12')
    })

    it('shows 12 as 12', () => {
      expect(display12HourValue(12)).toBe('12')
    })

    it('formats 1 as 01', () => {
      expect(display12HourValue(1)).toBe('01')
    })

    it('formats 13 as 01', () => {
      expect(display12HourValue(13)).toBe('01')
    })

    it('formats 23 as 11', () => {
      expect(display12HourValue(23)).toBe('11')
    })
  })
})
