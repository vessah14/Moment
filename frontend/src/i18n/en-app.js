// Traduction anglaise des pages qui ne passent pas par t() : tableau de bord, éditeur,
// assistant de création, paramètres, pages légales… Appliquée au texte affiché par
// domTranslate.js, chargée seulement quand l'anglais est choisi.
//
// Clé = texte français tel qu'il s'affiche (espaces normalisés). Un morceau variable
// s'écrit {0}, {1}… (ou {nom}) : « {0} invités » reconnaît « 12 invités ».
import PART1 from './app/part1'
import PART2 from './app/part2'
import PART3 from './app/part3'
import PART4 from './app/part4'
import PART5 from './app/part5'
import PART6 from './app/part6'

export default { ...PART1, ...PART2, ...PART3, ...PART4, ...PART5, ...PART6 }
