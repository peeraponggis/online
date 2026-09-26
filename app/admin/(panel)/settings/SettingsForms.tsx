'use client'

import { useActionState, useState } from 'react'
import { saveBankAction, saveSiteAction, type ActionState } from '../../actions'
import { Alert, Card, FieldShell, Toggle, inputClass, inputErrorClass } from '../../../components/admin/ui'
import { SubmitButton } from '../../../components/admin/SubmitButton'

const bankInitial: ActionState = { ok: false, message: '' }
const siteInitial: ActionState = { ok: false, message: '' }

export default function SettingsForms({
  bank,
  site,
}: {
  bank: { name: string; account: string; promptpay: string }
  site: {
    headline: string
    subline: string
    ctaPrimary: string
    ctaSecondary: string
    maintenance: boolean
  }
}) {
  const [bankState, bankAction] = useActionState(saveBankAction, bankInitial)
  const [siteState, siteAction] = useActionState(saveSiteAction, siteInitial)
  const [copied, setCopied] = useState(false)
  const be = bankState.errors ?? {}
  const se = siteState.errors ?? {}

  return (
    <div className="space-y-5">
      <Card title="ข้อมูลธนาคาร" description="ใช้แสดงในขั้นตอนการชำระเงิน — ตอนนี้ยังเป็นระบบจำลอง">
        <form action={bankAction} className="space-y-4">
          {bankState.message && (
            <Alert tone={bankState.ok ? 'success' : 'error'}>{bankState.message}</Alert>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <FieldShell
              label="ชื่อผู้รับเงิน"
              htmlFor="s-bank-name"
              error={be.name}
              required
            >
              <input
                id="s-bank-name"
                name="name"
                defaultValue={bank.name}
                className={be.name ? inputErrorClass : inputClass}
              />
            </FieldShell>

            <FieldShell label="เลขบัญชี" htmlFor="s-bank-account" error={be.account} required>
              <input
                id="s-bank-account"
                name="account"
                defaultValue={bank.account}
                className={`${be.account ? inputErrorClass : inputClass} font-mono`}
              />
            </FieldShell>

            <FieldShell
              label="เลขพร้อมเพย์"
              htmlFor="s-bank-promptpay"
              error={be.promptpay}
              hint="ตัวเลขล้วน ใช้สร้าง QR"
              required
            >
              <div className="flex gap-2">
                <input
                  id="s-bank-promptpay"
                  name="promptpay"
                  defaultValue={bank.promptpay}
                  className={`${be.promptpay ? inputErrorClass : inputClass} font-mono`}
                />
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(bank.promptpay)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    } catch {
                      setCopied(false)
                    }
                  }}
                  className="shrink-0 rounded-lg border border-emerald-300 px-3 py-2 text-sm text-emerald-700 hover:bg-emerald-50"
                >
                  {copied ? 'คัดลอกแล้ว' : 'คัดลอก'}
                </button>
              </div>
            </FieldShell>
          </div>

          <div className="flex justify-end">
            <SubmitButton label="บันทึกข้อมูลธนาคาร" />
          </div>
        </form>
      </Card>

      <Card title="ข้อความหน้าแรก" description="ข้อความที่แสดงในส่วนหัวของหน้าแรก">
        <form action={siteAction} className="space-y-4">
          {siteState.message && (
            <Alert tone={siteState.ok ? 'success' : 'error'}>{siteState.message}</Alert>
          )}

          <FieldShell label="พาดหัวหลัก" htmlFor="s-headline" error={se.headline} required>
            <input
              id="s-headline"
              name="headline"
              defaultValue={site.headline}
              className={se.headline ? inputErrorClass : inputClass}
            />
          </FieldShell>

          <FieldShell label="คำอธิบาย" htmlFor="s-subline" error={se.subline} required>
            <textarea
              id="s-subline"
              name="subline"
              rows={3}
              defaultValue={site.subline}
              className={se.subline ? inputErrorClass : inputClass}
            />
          </FieldShell>

          <div className="grid gap-4 sm:grid-cols-2">
            <FieldShell label="ข้อความปุ่มหลัก" htmlFor="s-cta-primary" error={se.ctaPrimary} required>
              <input
                id="s-cta-primary"
                name="ctaPrimary"
                defaultValue={site.ctaPrimary}
                className={se.ctaPrimary ? inputErrorClass : inputClass}
              />
            </FieldShell>

            <FieldShell label="ข้อความปุ่มรอง" htmlFor="s-cta-secondary" error={se.ctaSecondary} required>
              <input
                id="s-cta-secondary"
                name="ctaSecondary"
                defaultValue={site.ctaSecondary}
                className={se.ctaSecondary ? inputErrorClass : inputClass}
              />
            </FieldShell>
          </div>

          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
            <Toggle
              id="s-maintenance"
              name="maintenance"
              label="ปิดเว็บชั่วคราว (โหมดปรับปรุง)"
              description="เตรียมไว้ก่อน — ยังไม่ได้ผลกับหน้าสาธารณะ"
              defaultChecked={site.maintenance}
            />
          </div>

          <div className="flex justify-end">
            <SubmitButton label="บันทึกข้อความเว็บไซต์" />
          </div>
        </form>
      </Card>
    </div>
  )
}
