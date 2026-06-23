import React from 'react';

export default function TermsOfService() {
    return (
        <div style={{ backgroundColor: '#FFFFE3', minHeight: '100vh', padding: '40px 20px', fontFamily: 'sans-serif' }}>
            <div style={{ 
                maxWidth: '900px', 
                margin: '0 auto', 
                backgroundColor: '#FFFFFF', 
                borderRadius: '16px', 
                overflow: 'hidden',
                borderTop: '8px solid #01796F',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
            }}>
                
                {/* Header */}
                <div style={{ padding: '40px', borderBottom: '2px solid #B0C4DE' }}>
                    <h1 style={{ color: '#01796F', fontSize: '36px', fontWeight: 'bold', marginBottom: '10px' }}>Terms of Service</h1>
                    <p style={{ color: '#CBCBCB', fontWeight: '600' }}>Last updated: June 21, 2026</p>
                </div>

                <div style={{ padding: '40px', color: '#333', lineHeight: '1.6' }}>
                    {/* Intro */}
                    <div style={{ padding: '20px', backgroundColor: '#B0C4DE20', borderLeft: '4px solid #01796F', marginBottom: '30px' }}>
                        <p>Welcome to <strong style={{ color: '#01796F' }}>JobsMarket</strong>. By accessing or using our platform, you signify that you have read, understood, and agreed to be bound by these Terms of Service.</p>
                    </div>

                    {/* Danh sách 6 mục */}
                    <div style={{ marginBottom: '30px' }}>
                        <h3 style={{ color: '#01796F', fontSize: '20px', fontWeight: 'bold' }}>1. Account Obligations</h3>
                        <p>You agree to provide accurate, current, and complete information during the registration process. You are solely responsible for maintaining the confidentiality of your account credentials.</p>
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <h3 style={{ color: '#01796F', fontSize: '20px', fontWeight: 'bold' }}>2. Acceptable Use</h3>
                        <p>Users agree not to use the platform to post fraudulent, misleading, or illegal job listings, transmit viruses, or engage in unauthorized data scraping.</p>
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <h3 style={{ color: '#01796F', fontSize: '20px', fontWeight: 'bold' }}>3. Intellectual Property</h3>
                        <p>All content, features, and functionality on JobsMarket—including text, graphics, logos, and software—are the exclusive property of JobsMarket.</p>
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <h3 style={{ color: '#01796F', fontSize: '20px', fontWeight: 'bold' }}>4. Limitation of Liability</h3>
                        <p>JobsMarket acts as a venue for connecting job seekers and employers. We are not liable for any indirect, incidental, or consequential damages arising from your use of our platform.</p>
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <h3 style={{ color: '#01796F', fontSize: '20px', fontWeight: 'bold' }}>5. Service Modifications & Termination</h3>
                        <p>We reserve the right to modify or discontinue our service at any time without prior notice. We may terminate your access for violations of these Terms.</p>
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <h3 style={{ color: '#01796F', fontSize: '20px', fontWeight: 'bold' }}>6. Governing Law</h3>
                        <p>These Terms shall be governed by and construed in accordance with the laws of your jurisdiction, without regard to its conflict of law provisions.</p>
                    </div>

                    {/* Footer Contact */}
                    <div style={{ 
                        marginTop: '50px', 
                        padding: '30px', 
                        backgroundColor: '#01796F', 
                        color: '#FFFFFF', 
                        borderRadius: '12px' 
                    }}>
                        <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>Contact Us</h3>
                        <p>If you have any questions regarding these Terms, please contact us at:</p>
                        <a 
                            href="mailto:support@jobsmarket.com" 
                            style={{ color: '#B0C4DE', fontWeight: 'bold', fontSize: '18px', textDecoration: 'underline' }}
                        >
                            support@jobsmarket.com
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}