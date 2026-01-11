"""
Email Service for ReviewFlow

Handles sending email notifications using Resend API.
- New review notifications
- Private feedback alerts
- Weekly summary emails
"""

import os
import asyncio
import logging
import resend
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

# Initialize Resend with API key
RESEND_API_KEY = os.environ.get('RESEND_API_KEY')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY
    EMAIL_ENABLED = True
    logger.info("Email service initialized with Resend")
else:
    EMAIL_ENABLED = False
    logger.warning("RESEND_API_KEY not set - email notifications disabled")


def get_email_status() -> Dict[str, Any]:
    """Get current email service status"""
    return {
        "enabled": EMAIL_ENABLED,
        "provider": "resend" if EMAIL_ENABLED else None,
        "sender": SENDER_EMAIL if EMAIL_ENABLED else None,
        "message": "Email notifications active" if EMAIL_ENABLED else "Add RESEND_API_KEY to enable email notifications"
    }


async def send_email(
    to_email: str,
    subject: str,
    html_content: str,
    text_content: Optional[str] = None
) -> Dict[str, Any]:
    """
    Send an email using Resend API
    
    Args:
        to_email: Recipient email address
        subject: Email subject line
        html_content: HTML body of the email
        text_content: Plain text fallback (optional)
    
    Returns:
        Dict with status and email_id
    """
    if not EMAIL_ENABLED:
        logger.warning(f"Email not sent (disabled): {subject} to {to_email}")
        return {"status": "disabled", "message": "Email service not configured"}
    
    try:
        params = {
            "from": SENDER_EMAIL,
            "to": [to_email],
            "subject": subject,
            "html": html_content,
        }
        
        if text_content:
            params["text"] = text_content
        
        # Run sync SDK in thread to keep FastAPI non-blocking
        email = await asyncio.to_thread(resend.Emails.send, params)
        
        logger.info(f"Email sent successfully: {subject} to {to_email}")
        return {
            "status": "success",
            "email_id": email.get("id"),
            "message": f"Email sent to {to_email}"
        }
        
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        return {
            "status": "error",
            "message": str(e)
        }


# ============ EMAIL TEMPLATES ============

def get_new_review_email(
    business_name: str,
    reviewer_name: str,
    rating: int,
    review_text: str,
    platform: str,
    dashboard_url: str
) -> str:
    """Generate HTML email for new review notification"""
    
    stars = "★" * rating + "☆" * (5 - rating)
    star_color = "#10B981" if rating >= 4 else ("#F59E0B" if rating == 3 else "#EF4444")
    
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC; padding: 40px 20px;">
            <tr>
                <td align="center">
                    <table width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                        <!-- Header -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); padding: 32px; text-align: center;">
                                <h1 style="color: #FFFFFF; margin: 0; font-size: 24px; font-weight: 700;">
                                    ✨ New Review Alert!
                                </h1>
                            </td>
                        </tr>
                        
                        <!-- Content -->
                        <tr>
                            <td style="padding: 32px;">
                                <p style="color: #64748B; font-size: 14px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">
                                    {platform.upper()} REVIEW
                                </p>
                                <h2 style="color: #0F172A; margin: 0 0 24px 0; font-size: 20px;">
                                    {business_name}
                                </h2>
                                
                                <!-- Rating -->
                                <div style="background-color: #F8FAFC; border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center;">
                                    <p style="color: {star_color}; font-size: 32px; margin: 0 0 8px 0; letter-spacing: 4px;">
                                        {stars}
                                    </p>
                                    <p style="color: #64748B; font-size: 14px; margin: 0;">
                                        {rating} out of 5 stars
                                    </p>
                                </div>
                                
                                <!-- Review Content -->
                                <div style="border-left: 4px solid #4F46E5; padding-left: 16px; margin-bottom: 24px;">
                                    <p style="color: #0F172A; font-size: 16px; line-height: 1.6; margin: 0 0 12px 0; font-style: italic;">
                                        "{review_text}"
                                    </p>
                                    <p style="color: #64748B; font-size: 14px; margin: 0;">
                                        — {reviewer_name}
                                    </p>
                                </div>
                                
                                <!-- CTA Button -->
                                <a href="{dashboard_url}" style="display: inline-block; background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: #FFFFFF; text-decoration: none; padding: 14px 28px; border-radius: 9999px; font-weight: 600; font-size: 14px;">
                                    View in Dashboard →
                                </a>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="padding: 24px; background-color: #F8FAFC; text-align: center; border-top: 1px solid #E2E8F0;">
                                <p style="color: #94A3B8; font-size: 12px; margin: 0;">
                                    You're receiving this because you have email notifications enabled for {business_name}.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """


def get_private_feedback_email(
    business_name: str,
    customer_name: str,
    customer_email: str,
    customer_phone: str,
    rating: int,
    feedback_text: str,
    dashboard_url: str
) -> str:
    """Generate HTML email for private feedback notification"""
    
    stars = "★" * rating + "☆" * (5 - rating)
    
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC; padding: 40px 20px;">
            <tr>
                <td align="center">
                    <table width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                        <!-- Header -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); padding: 32px; text-align: center;">
                                <h1 style="color: #FFFFFF; margin: 0; font-size: 24px; font-weight: 700;">
                                    🔒 Private Feedback Received
                                </h1>
                            </td>
                        </tr>
                        
                        <!-- Content -->
                        <tr>
                            <td style="padding: 32px;">
                                <div style="background-color: #FEF3C7; border: 1px solid #FCD34D; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                                    <p style="color: #92400E; font-size: 14px; margin: 0;">
                                        ⚠️ This feedback was kept private. The customer chose not to post publicly. This is your opportunity to reach out and improve their experience.
                                    </p>
                                </div>
                                
                                <h2 style="color: #0F172A; margin: 0 0 24px 0; font-size: 20px;">
                                    {business_name}
                                </h2>
                                
                                <!-- Rating -->
                                <div style="background-color: #FEF2F2; border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center;">
                                    <p style="color: #EF4444; font-size: 32px; margin: 0 0 8px 0; letter-spacing: 4px;">
                                        {stars}
                                    </p>
                                    <p style="color: #64748B; font-size: 14px; margin: 0;">
                                        {rating} out of 5 stars
                                    </p>
                                </div>
                                
                                <!-- Feedback Content -->
                                <div style="border-left: 4px solid #F59E0B; padding-left: 16px; margin-bottom: 24px;">
                                    <p style="color: #0F172A; font-size: 16px; line-height: 1.6; margin: 0; font-style: italic;">
                                        "{feedback_text}"
                                    </p>
                                </div>
                                
                                <!-- Customer Contact -->
                                <div style="background-color: #F8FAFC; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                                    <h3 style="color: #0F172A; font-size: 14px; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">
                                        Customer Contact
                                    </h3>
                                    <p style="color: #0F172A; font-size: 16px; margin: 0 0 8px 0;">
                                        <strong>{customer_name}</strong>
                                    </p>
                                    {f'<p style="color: #64748B; font-size: 14px; margin: 0 0 4px 0;">📧 {customer_email}</p>' if customer_email else ''}
                                    {f'<p style="color: #64748B; font-size: 14px; margin: 0;">📱 {customer_phone}</p>' if customer_phone else ''}
                                </div>
                                
                                <!-- CTA Button -->
                                <a href="{dashboard_url}" style="display: inline-block; background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: #FFFFFF; text-decoration: none; padding: 14px 28px; border-radius: 9999px; font-weight: 600; font-size: 14px;">
                                    View All Feedback →
                                </a>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="padding: 24px; background-color: #F8FAFC; text-align: center; border-top: 1px solid #E2E8F0;">
                                <p style="color: #94A3B8; font-size: 12px; margin: 0;">
                                    You're receiving this because you have email notifications enabled for {business_name}.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """


def get_welcome_email(
    user_name: str,
    business_name: str,
    dashboard_url: str
) -> str:
    """Generate HTML email for welcome/onboarding"""
    
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC; padding: 40px 20px;">
            <tr>
                <td align="center">
                    <table width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                        <!-- Header -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); padding: 48px 32px; text-align: center;">
                                <h1 style="color: #FFFFFF; margin: 0 0 8px 0; font-size: 32px; font-weight: 800;">
                                    Welcome to ReviewFlow! 🎉
                                </h1>
                                <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 16px;">
                                    You're all set to transform your reviews into growth
                                </p>
                            </td>
                        </tr>
                        
                        <!-- Content -->
                        <tr>
                            <td style="padding: 32px;">
                                <p style="color: #0F172A; font-size: 18px; margin: 0 0 24px 0;">
                                    Hi {user_name}! 👋
                                </p>
                                <p style="color: #64748B; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                                    Thanks for signing up for ReviewFlow. We're excited to help <strong>{business_name}</strong> get more 5-star reviews and turn customer feedback into growth.
                                </p>
                                
                                <!-- Quick Start Steps -->
                                <h3 style="color: #0F172A; font-size: 16px; margin: 0 0 16px 0;">
                                    Get started in 3 easy steps:
                                </h3>
                                
                                <div style="margin-bottom: 24px;">
                                    <div style="display: flex; align-items: flex-start; margin-bottom: 16px;">
                                        <span style="display: inline-block; width: 28px; height: 28px; background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: #FFFFFF; border-radius: 50%; text-align: center; line-height: 28px; font-weight: 700; font-size: 14px; margin-right: 12px; flex-shrink: 0;">1</span>
                                        <div>
                                            <p style="color: #0F172A; font-size: 14px; font-weight: 600; margin: 0 0 4px 0;">Connect your platforms</p>
                                            <p style="color: #64748B; font-size: 14px; margin: 0;">Link your Google Business & Facebook Page</p>
                                        </div>
                                    </div>
                                    <div style="display: flex; align-items: flex-start; margin-bottom: 16px;">
                                        <span style="display: inline-block; width: 28px; height: 28px; background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: #FFFFFF; border-radius: 50%; text-align: center; line-height: 28px; font-weight: 700; font-size: 14px; margin-right: 12px; flex-shrink: 0;">2</span>
                                        <div>
                                            <p style="color: #0F172A; font-size: 14px; font-weight: 600; margin: 0 0 4px 0;">Generate your QR code</p>
                                            <p style="color: #64748B; font-size: 14px; margin: 0;">Place it at your store or share digitally</p>
                                        </div>
                                    </div>
                                    <div style="display: flex; align-items: flex-start;">
                                        <span style="display: inline-block; width: 28px; height: 28px; background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: #FFFFFF; border-radius: 50%; text-align: center; line-height: 28px; font-weight: 700; font-size: 14px; margin-right: 12px; flex-shrink: 0;">3</span>
                                        <div>
                                            <p style="color: #0F172A; font-size: 14px; font-weight: 600; margin: 0 0 4px 0;">Watch reviews roll in</p>
                                            <p style="color: #64748B; font-size: 14px; margin: 0;">Respond with AI-powered suggestions</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- CTA Button -->
                                <a href="{dashboard_url}" style="display: inline-block; background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: #FFFFFF; text-decoration: none; padding: 16px 32px; border-radius: 9999px; font-weight: 600; font-size: 16px;">
                                    Go to Dashboard →
                                </a>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="padding: 24px; background-color: #F8FAFC; text-align: center; border-top: 1px solid #E2E8F0;">
                                <p style="color: #64748B; font-size: 14px; margin: 0 0 8px 0;">
                                    Questions? Just reply to this email — we're here to help!
                                </p>
                                <p style="color: #94A3B8; font-size: 12px; margin: 0;">
                                    © 2025 ReviewFlow. All rights reserved.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """


async def send_new_review_notification(
    to_email: str,
    business_name: str,
    reviewer_name: str,
    rating: int,
    review_text: str,
    platform: str,
    dashboard_url: str
) -> Dict[str, Any]:
    """Send notification email for new review"""
    subject = f"{'🌟' if rating >= 4 else '📝'} New {rating}-star review on {platform.capitalize()}"
    html = get_new_review_email(
        business_name, reviewer_name, rating, review_text, platform, dashboard_url
    )
    return await send_email(to_email, subject, html)


async def send_private_feedback_notification(
    to_email: str,
    business_name: str,
    customer_name: str,
    customer_email: str,
    customer_phone: str,
    rating: int,
    feedback_text: str,
    dashboard_url: str
) -> Dict[str, Any]:
    """Send notification email for private feedback"""
    subject = f"🔒 Private feedback received from {customer_name}"
    html = get_private_feedback_email(
        business_name, customer_name, customer_email, customer_phone,
        rating, feedback_text, dashboard_url
    )
    return await send_email(to_email, subject, html)


async def send_welcome_email(
    to_email: str,
    user_name: str,
    business_name: str,
    dashboard_url: str
) -> Dict[str, Any]:
    """Send welcome email to new users"""
    subject = f"Welcome to ReviewFlow, {user_name}! 🎉"
    html = get_welcome_email(user_name, business_name, dashboard_url)
    return await send_email(to_email, subject, html)
