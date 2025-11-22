export const ORDER_CONFIRMATION_TEMPLATE = {
  subject: 'Заказ №{{orderNumber}} принят',
  htmlBody: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; background-color: #f5f5f5; }
    .email-wrapper { background-color: #f5f5f5; padding: 40px 20px; }
    .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .logo { text-align: center; padding: 24px 20px; background: #ffffff; }
    .logo img { max-width: 180px; height: auto; }
    .content { padding: 40px 30px; }
    .greeting { font-size: 20px; font-weight: 600; color: #1a1a1a; margin-bottom: 8px; }
    .order-number { font-size: 14px; color: #666; margin-bottom: 30px; }
    .divider { height: 1px; background: #e5e5e5; margin: 30px 0; }
    .section-title { font-size: 14px; font-weight: 600; color: #1a1a1a; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
    .info-label { color: #666; }
    .info-value { color: #1a1a1a; font-weight: 500; }
    .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .items-table th { text-align: left; padding: 12px 0; font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e5e5e5; }
    .items-table td { padding: 16px 0; font-size: 14px; border-bottom: 1px solid #f0f0f0; }
    .items-table td:first-child { color: #1a1a1a; }
    .items-table td:last-child { text-align: right; font-weight: 600; }
    .total-row { font-size: 20px; font-weight: 600; color: #1a1a1a; padding-top: 16px; }
    .footer { background: #fafafa; padding: 30px; text-align: center; font-size: 12px; color: #666; }
    .footer p { margin: 4px 0; }
    .footer a { color: #667eea; text-decoration: none; }
    @media only screen and (max-width: 600px) {
      .email-wrapper { padding: 20px 10px; }
      .content { padding: 30px 20px; }
      .logo img { max-width: 150px; }
      .items-table { font-size: 12px; }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      <div class="logo">
        <img src="{{logoUrl}}" alt="Idylle" />
      </div>
      <div class="content">
        <div class="greeting">Благодарим за ваш заказ!</div>
        <div class="order-number">Номер заказа: <strong>#{{orderNumber}}</strong></div>
        <div class="divider"></div>
        <div class="section-title">Детали получателя</div>
        <div class="info-row">
          <span class="info-label">ФИО:</span>
          <span class="info-value">{{firstName}} {{lastName}}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Email:</span>
          <span class="info-value">{{email}}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Телефон:</span>
          <span class="info-value">{{phone}}</span>
        </div>
        <div class="divider"></div>
        <div class="section-title">Доставка и оплата</div>
        <div class="info-row">
          <span class="info-label">Способ доставки:</span>
          <span class="info-value">{{deliveryMethod}}</span>
        </div>
        {{#if deliveryAddress}}
        <div style="padding: 8px 0; font-size: 14px;">
          <span class="info-label">Адрес:</span>
          <span style="color: #1a1a1a;">{{deliveryAddress}}</span>
        </div>
        {{/if}}
        <div class="info-row">
          <span class="info-label">Способ оплаты:</span>
          <span class="info-value">{{paymentMethod}}</span>
        </div>
        <div class="divider"></div>
        <div class="section-title">Состав заказа</div>
        <table class="items-table">
          <thead>
            <tr>
              <th>Товар</th>
              <th style="text-align: right;">Кол-во</th>
              <th style="text-align: right;">Сумма</th>
            </tr>
          </thead>
          <tbody>
            {{#each orderItems}}
            <tr>
              <td>
                {{name}}{{#if variantInfo}}<br><span style="color: #999; font-size: 12px;">{{variantInfo}}</span>{{/if}}
              </td>
              <td style="text-align: right;">{{quantity}}</td>
              <td class="total-row">{{total}} ₽</td>
            </tr>
            {{/each}}
          </tbody>
        </table>
        <div class="divider"></div>
        <div style="text-align: right;">
          <div style="font-size: 24px; font-weight: 600; color: #1a1a1a;">
            Итого: {{totalAmount}} ₽
          </div>
        </div>
        {{#if notes}}
        <div style="margin-top: 20px; padding: 16px; background: #fafafa; border-radius: 8px; font-size: 14px;">
          <strong style="color: #1a1a1a;">Комментарий:</strong>
          <p style="margin: 8px 0 0 0; color: #666;">{{notes}}</p>
        </div>
        {{/if}}
      </div>
      <div class="footer">
        <p>Если у вас возникли вопросы, мы с радостью поможем!</p>
        <p><a href="mailto:info@idylle.spb.ru">info@idylle.spb.ru</a> | <a href="tel:+78121234567">+7 (812) 123-45-67</a></p>
        <p style="margin-top: 16px; color: #999;">© 2024 Idylle. Все права защищены.</p>
      </div>
    </div>
  </div>
</body>
</html>`,
};
