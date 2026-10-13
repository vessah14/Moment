import ReviewsPanel from '../components/admin/ReviewsPanel'
import AdminLayout from '../components/layout/AdminLayout'

export default function AdminReviews () {
  return (
    <AdminLayout>
      <div>
        <h1 className='text-2xl font-bold text-ink'>Avis clients</h1>
        <p className='mt-1.5 text-sm text-muted'>
          Consultez les commentaires reçus et choisissez ceux qui sont publiés
          sur le site.
        </p>
      </div>
      <ReviewsPanel />
    </AdminLayout>
  )
}
