import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';

export const SEOFooter: React.FC = () => {
    const { language } = useTranslation();

    return (
        <footer className="seo-footer">
            <div className="seo-content" role="contentinfo">
                {language === 'zh' ? (
                    <>
                        <h4 className="sr-only">专业的扑克计分工具</h4>
                        <p>
                            <span>拖拉机扑克计分器</span> · <span>升级/双扣计分工具</span> · <span>Tractor Scorekeeper Online</span>
                        </p>
                    </>
                ) : (
                    <>
                        <h4 className="sr-only">Professional Poker Scorekeeping Tool</h4>
                        <p>
                            <span>online Scorekeeper for Tractor Card Game</span> · <span>Sheng Ji / Shuang Kou Tracker</span> · <span>拖拉机扑克计分器</span>
                        </p>
                    </>
                )}
                
            </div>
        </footer>
    );
};
