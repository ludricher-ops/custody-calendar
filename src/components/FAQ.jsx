import { useEffect } from 'react';

const QUESTIONS = [
  {
    q: 'Comment assigner la garde d\'un jour ?',
    a: 'Clique directement sur un jour dans le calendrier. Une fenêtre s\'ouvre avec deux lignes — une pour Avril 🌸, une pour Léo 🌊. Clique sur "Alice" ou "Ludo" pour chaque enfant. Cliquer à nouveau sur le bouton actif le désélectionne (garde non définie).',
  },
  {
    q: 'Comment modifier plusieurs jours en même temps ?',
    a: 'Clique sur "☑ Sélection multiple" dans le header. Sélectionne ensuite les jours un par un, ou utilise "Tout le mois" pour sélectionner tous les jours d\'un mois d\'un coup. Le panneau en bas de page te permet alors d\'assigner la garde pour tous les jours sélectionnés en une seule action.',
  },
  {
    q: 'Que signifient les cercles A et L sur chaque jour ?',
    a: 'A = Avril, L = Léo. La couleur du cercle indique qui a la garde : rose pour Alice, bleu pour Ludo, gris si non défini.',
  },
  {
    q: 'Comment sont calculés les KPI ?',
    a: 'Le tableau "Garde" comptabilise les jours où le parent a au moins un enfant. Les colonnes "Avril" et "Léo" comptent indépendamment les jours de garde pour chaque enfant. Les chiffres mensuels et le total annuel se mettent à jour automatiquement dès qu\'un jour est modifié.',
  },
  {
    q: 'Que signifie "Effacer" dans la sélection multiple ?',
    a: '"Effacer" supprime l\'assignation existante pour cet enfant sur tous les jours sélectionnés (remet à "non défini"). "Inchangé" (par défaut) conserve la valeur déjà enregistrée — pratique pour ne modifier qu\'un seul enfant sans toucher à l\'autre.',
  },
  {
    q: 'Comment sont affichées les vacances scolaires ?',
    a: 'Les vacances scolaires d\'Île-de-France (Zone C) apparaissent avec un fond jaune clair et un petit point jaune dans le coin des cellules. Les jours fériés ont un fond orange et leur numéro affiché en orange. Les périodes couvertes vont de 2024 à 2027.',
  },
  {
    q: 'Les données sont-elles perdues si je ferme l\'onglet ?',
    a: 'Non. Toutes les modifications sont sauvegardées en temps réel dans la base de données. Elles sont accessibles depuis n\'importe quel appareil ou navigateur.',
  },
  {
    q: 'Le message "Erreur de connexion" s\'affiche — que faire ?',
    a: 'Ce message signifie que l\'application ne peut pas atteindre le serveur. Vérifie ta connexion internet et recharge la page. Si le problème persiste, le serveur Railway est peut-être en train de redémarrer (quelques secondes suffisent).',
  },
];

export default function FAQ({ onClose }) {
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="faq-modal" onClick={e => e.stopPropagation()}>
        <div className="faq-header">
          <h2>FAQ — Aide</h2>
          <button className="modal-close" onClick={onClose} aria-label="Fermer">×</button>
        </div>
        <div className="faq-body">
          {QUESTIONS.map((item, i) => (
            <details key={i} className="faq-item">
              <summary className="faq-question">{item.q}</summary>
              <p className="faq-answer">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
