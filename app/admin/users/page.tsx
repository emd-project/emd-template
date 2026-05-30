import { getSession } from '@/packages/cms/lib/get-session'
import { redirect } from 'next/navigation'
import { UsersManager } from '@/packages/cms/components/UsersManager'

export default async function UsersPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/admin')

  return <UsersManager />
}
