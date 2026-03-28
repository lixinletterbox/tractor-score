import React, { useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext';

interface ContactFormProps {
    onClose: () => void;
}

export const ContactForm: React.FC<ContactFormProps> = ({ onClose }) => {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [result, setResult] = useState("");

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setStatus('loading');
        const formData = new FormData(event.currentTarget);
        formData.append("access_key", "8f9d4768-e4bb-4f0c-8129-3dd8e6f5aefb");

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData
            });

            const data = await response.json();
            if (data.success) {
                setStatus('success');
                setResult("Successfully sent message!");
                setTimeout(() => onClose(), 2000); // Close the modal automatically after 2s
            } else {
                setStatus('error');
                setResult(data.message || "Failed to send message. Please try again later.");
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setStatus('error');
            setResult("An unexpected error occurred.");
        }
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

                <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label htmlFor="contact-name" style={{ marginBottom: '0.5rem', display: 'block' }}>
                            {t('contact.name')}
                        </label>
                        <input type="hidden" name="subject" value="Tractor Score Feedback"></input>
                        <input
                            id="contact-name"
                            name="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-main)' }}
                        />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                        <label htmlFor="contact-email" style={{ marginBottom: '0.5rem', display: 'block' }}>
                            Email
                        </label>
                        <input
                            id="contact-email"
                            name="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            //required
                            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-main)' }}
                        />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                        <label htmlFor="contact-message" style={{ marginBottom: '0.5rem', display: 'block' }}>
                            {t('contact.body')}
                        </label>
                        <textarea
                            id="contact-message"
                            name="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                            rows={5}
                            disabled={status === 'loading' || status === 'success'}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-color)',
                                background: 'var(--bg-surface)',
                                color: 'var(--text-main)',
                                resize: 'vertical',
                                opacity: status === 'loading' || status === 'success' ? 0.7 : 1
                            }}
                        />
                    </div>

                    {status === 'success' && (
                        <div className="animate-fade-in" style={{ color: 'var(--success-color, #10b981)', padding: '0.5rem', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.1)', textAlign: 'center' }}>
                            {result}
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="animate-fade-in" style={{ color: 'var(--danger-color, #ef4444)', padding: '0.5rem', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.1)', textAlign: 'center' }}>
                            {result}
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                        <button type="button" className="btn btn-outline" onClick={onClose} disabled={status === 'loading'}>
                            {t('contact.close')}
                        </button>
                        <button type="submit" className="btn btn-accent" disabled={status === 'loading' || status === 'success'}>
                            {status === 'loading' ? '⏳ Sending...' : `${t('contact.send')} ✉️`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};