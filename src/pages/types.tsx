import Link from 'next/link'
import TypeBadge from '@/components/TypeBadge'
import type { MemoryType } from '@/types/memory'

interface TypeInfo {
  type: MemoryType
  color: string
  tagline: string
  description: string
  whenToSave: string
  whenUsed: string
  howToUse: string
  bodyStructure?: string
  example: { trigger: string; saved: string }
}

const TYPES: TypeInfo[] = [
  {
    type: 'user',
    color: '#3b82f6',
    tagline: 'ข้อมูลเกี่ยวกับตัวผู้ใช้',
    description:
      'เก็บข้อมูลเกี่ยวกับบทบาท เป้าหมาย ความรับผิดชอบ และความรู้ของผู้ใช้ ช่วยให้ Claude ปรับแนวทางการช่วยเหลือให้เหมาะกับแต่ละคน เช่น อธิบายสิ่งเดียวกันต่างกันระหว่าง senior engineer กับ นักเรียนที่เพิ่งเริ่มเขียนโค้ด',
    whenToSave: 'เมื่อรู้ข้อมูลเกี่ยวกับ role, preference, ความเชี่ยวชาญ หรือบริบทการทำงานของผู้ใช้',
    whenUsed: 'ทุกครั้งที่ตอบคำถามหรืออธิบายโค้ด — ใช้เพื่อปรับระดับและวิธีนำเสนอให้เหมาะกับคนนั้น',
    howToUse: 'ปรับโทน ระดับคำอธิบาย และ framing ให้ตรงกับ background ของผู้ใช้',
    example: {
      trigger: '"ผมเขียน Go มา 10 ปีแต่เพิ่งแตะ React ครั้งแรก"',
      saved: 'ผู้ใช้เชี่ยวชาญ Go มาก, ใหม่กับ React — อธิบาย frontend โดยเปรียบกับ concept ใน backend',
    },
  },
  {
    type: 'feedback',
    color: '#f97316',
    tagline: 'คำแนะนำเกี่ยวกับวิธีทำงานร่วมกัน',
    description:
      'เก็บ guidance ที่ผู้ใช้ให้ไว้ — ทั้งสิ่งที่ไม่ควรทำ และสิ่งที่ทำแล้วถูกใจ เป็น memory ที่สำคัญที่สุดสำหรับความต่อเนื่อง เพราะทำให้ Claude ไม่ต้องได้รับคำแนะนำซ้ำในทุก conversation',
    whenToSave:
      'เมื่อผู้ใช้แก้ไขแนวทาง ("อย่าทำแบบนี้") หรือยืนยันแนวทางที่ไม่ชัดเจน ("ใช่ แบบนี้แหละ ทำต่อไป")',
    whenUsed: 'ก่อนเริ่มทำงานทุกครั้ง — ใช้เป็น constraint เพื่อหลีกเลี่ยงข้อผิดพลาดที่เคยเกิดขึ้น',
    howToUse: 'ปรับพฤติกรรมในทุก conversation ตาม rule ที่บันทึกไว้',
    bodyStructure: 'ขึ้นด้วย rule → **Why:** เหตุผล → **How to apply:** เงื่อนไขที่ rule ใช้บังคับ',
    example: {
      trigger: '"อย่า mock database ในเทสต์พวกนี้ — เคยเจ็บมาแล้วตอน migration ล้มเหลว"',
      saved: 'integration test ต้องใช้ database จริงเท่านั้น — Why: mock ทำให้ไม่เห็น bug ตอน migration',
    },
  },
  {
    type: 'project',
    color: '#22c55e',
    tagline: 'บริบทของงานที่กำลังทำ',
    description:
      'เก็บข้อมูลเกี่ยวกับงาน เป้าหมาย timeline หรือ incident ปัจจุบัน ที่ไม่สามารถหาได้จากโค้ดหรือ git history ช่วยให้ Claude เข้าใจ "ทำไม" ของสิ่งที่ผู้ใช้ขอ ไม่ใช่แค่ "อะไร"',
    whenToSave: 'เมื่อรู้ว่าใครทำอะไร ทำไม หรือภายในเมื่อไร — แปลงวันที่สัมพัทธ์เป็นวันที่จริงเสมอ',
    whenUsed: 'เมื่อ request ดูเกี่ยวกับงานปัจจุบัน เช่น "ทำไมถึงแก้ตรงนี้" หรือ "ควร prioritize อะไรก่อน"',
    howToUse: 'ใช้เพื่อเข้าใจ motivation เบื้องหลัง request และให้คำแนะนำที่ตรงบริบทมากขึ้น',
    bodyStructure: 'ขึ้นด้วย fact/decision → **Why:** แรงจูงใจ → **How to apply:** ผลกระทบต่องาน',
    example: {
      trigger: '"เราจะ freeze merge หลังวันพฤหัส — mobile team กำลัง cut release branch"',
      saved: 'merge freeze เริ่ม 2026-03-05 เพื่อ mobile release — แจ้งเตือนถ้า PR ไม่เร่งด่วนนัด merge หลังวันนั้น',
    },
  },
  {
    type: 'reference',
    color: '#a855f7',
    tagline: 'ลิงก์ไปยังแหล่งข้อมูลภายนอก',
    description:
      'เก็บ pointer ไปยัง resource ใน external system เช่น Linear project, Grafana dashboard, Slack channel หรือ doc ที่เฉพาะเจาะจง ช่วยให้ Claude รู้ว่าต้องไปหาข้อมูล up-to-date ที่ไหน',
    whenToSave: 'เมื่อรู้ว่า resource นอก codebase อยู่ที่ไหน และมีไว้ทำอะไร',
    whenUsed: 'เมื่อผู้ใช้อ้างถึง external system หรือขอข้อมูลที่ต้องไปหาจากแหล่งภายนอก',
    howToUse: 'เปิด resource นั้นเมื่อต้องการข้อมูลที่อัปเดตจาก external system',
    example: {
      trigger: '"ดู Linear project "INGEST" ถ้าอยากรู้ context ของ pipeline bug"',
      saved: 'pipeline bug tracked ใน Linear project "INGEST"',
    },
  },
]

export default function TypesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Memory Types</h1>
          <p className="text-sm text-gray-500 mt-0.5">คำอธิบายของแต่ละ type ใน memory system</p>
        </div>
        <Link href="/" className="text-sm text-indigo-600 hover:underline">← Back to list</Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {TYPES.map((info) => (
          <div key={info.type} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: info.color }}
              />
              <TypeBadge type={info.type} />
              <span className="text-sm text-gray-500">{info.tagline}</span>
            </div>

            <div className="px-5 py-4 space-y-4">
              <p className="text-sm text-gray-700 leading-relaxed">{info.description}</p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="bg-gray-50 rounded-lg px-4 py-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">เมื่อไรควรบันทึก</p>
                  <p className="text-sm text-gray-700">{info.whenToSave}</p>
                </div>
                <div className="bg-blue-50 rounded-lg px-4 py-3">
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">ถูกเรียกใช้ตอนไหน</p>
                  <p className="text-sm text-gray-700">{info.whenUsed}</p>
                </div>
                <div className="bg-gray-50 rounded-lg px-4 py-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">วิธีใช้</p>
                  <p className="text-sm text-gray-700">{info.howToUse}</p>
                </div>
              </div>

              {info.bodyStructure && (
                <div className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-3">
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">โครงสร้างเนื้อหา</p>
                  <p className="text-sm text-amber-800">{info.bodyStructure}</p>
                </div>
              )}

              <div className="border border-gray-100 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">ตัวอย่าง</p>
                </div>
                <div className="px-4 py-3 space-y-2">
                  <div>
                    <span className="text-xs text-gray-400 font-medium">ผู้ใช้พูดว่า: </span>
                    <span className="text-sm text-gray-700 italic">{info.example.trigger}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 font-medium">บันทึกว่า: </span>
                    <span className="text-sm text-gray-700">{info.example.saved}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </main>
    </div>
  )
}
