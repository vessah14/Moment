import { useEffect } from 'react'
import { siteBlockDomId } from '../../utils/sitePage'
import SitePage from '../site/SitePage'

// Cadre de l'aperçu du Builder. Le contenu est SitePage, exactement le même rendu que
// le mini-site public (/e/:slug) : ce que l'organisateur voit ici est ce qui est publié.
export default function BuilderCanvas({
  slug,
  blocks,
  blockContent,
  selectedBlock,
  onSelectBlock,
  onChangeBlockContent,
  onReorderBlock,
  onRemoveBlock,
  device,
  heroStyle,
  template,
  data,
  uploading,
  onUploadBlockImage,
  onUploadGalleryPhotos,
  onAddGuestBookEntry,
  readOnly = false,
}) {
  useEffect(() => {
    if (!selectedBlock) return
    const el = document.getElementById(siteBlockDomId(selectedBlock))
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [selectedBlock])

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-surface px-3 py-4 sm:px-8 sm:py-6">
      <p className="truncate text-center font-mono text-xs text-faint">
        tbfmoment.com/{slug}
      </p>

      <SitePage
        template={template}
        heroStyle={heroStyle}
        blocks={blocks}
        blockContent={blockContent}
        data={{ ...data, slug }}
        className={`mx-auto mt-3 w-full rounded-xl shadow-xl transition-all sm:mt-4 ${
          device === 'mobile' ? 'max-w-[390px]' : 'max-w-2xl'
        }`}
        editor={
          readOnly
            ? null
            : {
                selectedBlock,
                onSelectBlock,
                onChangeBlockContent,
                onReorderBlock,
                onRemoveBlock,
                uploading,
                onUploadBlockImage,
                onUploadGalleryPhotos,
                onAddGuestBookEntry,
              }
        }
      />
    </div>
  )
}
