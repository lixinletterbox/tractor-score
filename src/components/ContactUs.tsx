import React, { useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext';

interface ContactUsProps {
    onClose: () => void;
}

export const ContactUs: React.FC<ContactUsProps> = ({ onClose }) => {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Construct the mailto link
        const subject = encodeURIComponent(`Tractor Score Support from ${name}`);
        const body = encodeURIComponent(message);
        window.location.href = `mailto:lixinletterbox@gmail.com?subject=${subject}&body=${body}`;
        
        // Close modal after attempting to open mail client
        onClose();
    };

    return (
        <div 
            className="animate-fade-in" 
            style={{ 
                position: 'fixed', 
                top: 0, left: 0, right: 0, bottom: 0, 
                backgroundColor: 'rgba(15, 23, 42, 0.8)', 
                backdropFilter: 'blur(8px)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                zIndex: 9999 
            }}
            onClick={onClose}
        >
            <div className="glass-card" style={{ maxWidth: '500px', width: '90%' }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0 }}>{t('contact.title')}</h3>
                    <button 
                        onClick={onClose} 
                        style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}
                    >
                        &times;
                    </button>
                </div>
                
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    {t('contact.subtitle')}
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label htmlFor="contact-name" style={{ marginBottom: '0.5rem', display: 'block' }}>
                            {t('contact.name')}
                        </label>
                        <input
                            id="contact-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-main)' }}
                        />
                    </div>
                    
                    <div className="form-group" style={{ margin: 0 }}>
                        <label htmlFor="contact-message" style={{ marginBottom: '0.5rem', display: 'block' }}>
                            {t('contact.body')}
                        </label>
                        <textarea
                            id="contact-message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                            rows={5}
                            style={{ 
                                width: '100%', 
                                padding: '0.75rem', 
                                borderRadius: 'var(--radius-md)', 
                                border: '1px solid var(--border-color)', 
                                background: 'var(--bg-surface)', 
                                color: 'var(--text-main)',
                                resize: 'vertical'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                        <button type="button" className="btn btn-outline" onClick={onClose}>
                            {t('contact.close')}
                        </button>
                        <button type="submit" className="btn btn-accent">
                            {t('contact.send')} ✉️
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
