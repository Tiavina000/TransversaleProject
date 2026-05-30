import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { classesAPI, notifAPI } from '../../services/api';
import useAuth from '../../hooks/useAuth';
import './MesClasses.css';

const EleveRow = ({ eleve, index }) => {
  const { t } = useTranslation();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSignaler = async () => {
    if (sending || sent) return;
    setSending(true);
    try {
      await notifAPI.signalerRetard({
        etudiant_id: eleve.id,
        message: t('mesClasses.notification_message', { name: eleve.prenom, count: eleve.chapitres_en_attente })
      });
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    } catch (err) {
      console.error("Erreur envoi notification", err);
    } finally {
      setSending(false);
    }
  };

  const pending = eleve.chapitres_en_attente;
  const total = eleve.total_chapitres;
  const ratio = total > 0 ? ((total - pending) / total) * 100 : 0;

  return (
    <div className="eleve-row">
      <span className="eleve-index">{index}</span>
      <span className="eleve-nom">{eleve.prenom}</span>
      <span className="eleve-num">{eleve.numero_etudiant}</span>
      <span className="eleve-email">{eleve.email}</span>
      {total !== undefined && (
        <>
          <span className="eleve-stats">
            <span className="eleve-stats-bar">
              <span className="eleve-stats-fill" style={{ width: `${ratio}%` }} />
            </span>
            <span className="eleve-stats-text">
              {eleve.chapitres_valides}/{total}
            </span>
          </span>
          <span className="eleve-action">
            {pending > 0 && (
              <button
                className={`eleve-btn-signaler ${sent ? 'sent' : ''}`}
                onClick={handleSignaler}
                disabled={sending || sent}
                title={`${pending} chapitre(s) en attente`}
              >
                {sending ? '...' : sent ? t('mesClasses.notified') : t('mesClasses.report')}
              </button>
            )}
          </span>
        </>
      )}
    </div>
  );
};

const ClasseCard = ({ classe, expanded, onToggle }) => {
  const { t } = useTranslation();
  const count = classe.eleves?.length || 0;

  return (
    <div className={`classe-card ${expanded ? 'expanded' : ''}`}>
      <button className="classe-header" onClick={onToggle}>
        <span className="classe-nom">{classe.nom}</span>
        <span className="classe-niveau">{classe.niveau_nom}</span>
        <span className="classe-eleves-count">{t('mesClasses.students_count', { count })}</span>
        <span className={`classe-chevron ${expanded ? 'open' : ''}`}>▾</span>
      </button>
      {expanded && (
        <div className="classe-body">
          {classe.professeurs?.length > 0 && (
            <div className="classe-professeurs">
              <strong>{t('mesClasses.teachers_label')}</strong>
              {classe.professeurs.map((p) => (
                <span key={p.id} className="professeur-tag">{p.specialite}</span>
              ))}
            </div>
          )}
          <div className="eleves-list">
            <div className="eleve-header">
              <span className="eleve-index">{t('mesClasses.table_hash')}</span>
              <span className="eleve-nom">{t('mesClasses.table_name')}</span>
              <span className="eleve-num">{t('mesClasses.table_number')}</span>
              <span className="eleve-email">{t('mesClasses.table_email')}</span>
              <span className="eleve-stats">{t('mesClasses.table_progress')}</span>
              <span className="eleve-action">{t('mesClasses.table_action')}</span>
            </div>
            {classe.eleves?.map((e, i) => (
              <EleveRow key={e.id} eleve={e} index={i + 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const MesClasses = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation();
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const params = {};
        if (user?.type_utilisateur === 'ENSEIGNANT' && user?.enseignant_profile) {
          let etabId = user.enseignant_profile.etablissement;
          if (typeof etabId === 'object' && etabId !== null) {
            const etab = etabId;
            etabId = etab.id;
          }
          if (etabId) params.etablissement = etabId;
        }
        const res = await classesAPI.list(params);
        setClasses(res.data.results || res.data || []);
      } catch (err) {
        console.error('Erreur chargement classes', err);
        setError(t('mesClasses.load_error'));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  if (loading) {
    return <div className="mes-classes-loading">{t('mesClasses.loading')}</div>;
  }

  if (error) {
    return <div className="mes-classes-error">{error}</div>;
  }

  if (!classes.length) {
    return (
      <div className="mes-classes-empty">
        {t('mesClasses.no_classes')}
      </div>
    );
  }

  return (
    <div className="mes-classes-container">
      <div className="mes-classes-header">
        <h2>{t('mesClasses.title')}</h2>
        <span className="mes-classes-total">{t('mesClasses.class_plural', { count: classes.length })}</span>
      </div>
      <div className="mes-classes-list">
        {classes.map((c) => (
          <ClasseCard
            key={c.id}
            classe={c}
            expanded={expandedId === c.id}
            onToggle={() => setExpandedId(expandedId === c.id ? null : c.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default MesClasses;