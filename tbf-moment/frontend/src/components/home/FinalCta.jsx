import { Link } from 'react-router-dom'
import Button from '../ui/Button'

export default function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(120deg,_var(--color-brand-orange),_var(--color-brand-pink))]">
      <div className="relative mx-auto max-w-3xl px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-white">
          Prêt à créer votre prochain moment ?
        </h2>
        <p className="mt-4 text-white/80">
          Rejoignez les milliers d'organisateurs d'événements qui commencent
          aujourd'hui, sans carte bancaire.
        </p>
        <Button as={Link} to="/inscription" variant="white" className="mt-8">
          Commencer gratuitement
        </Button>
      </div>
    </section>
  )
}
