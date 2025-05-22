import PromoCode from '../models/promoModel.js';

// البحث عن كوبون الخصم باستخدام الكود نفسه
export const getPromoByCode = async (req, res) => {
  try {
    const promoCode = await PromoCode.findOne({ 
      code: req.params.code.toUpperCase() 
    });

    if (!promoCode) {
      return res.status(404).json({ 
        success: false,
        message: 'كود الخصم غير موجود'
      });
    }

    res.json({
      success: true,
      data: promoCode
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// إنشاء كود خصم جديد
export const createPromoCode = async (req, res) => {
  try {
    // تحويل الكود لحروف كبيرة
    req.body.code = req.body.code.toUpperCase();
    
    const newPromo = await PromoCode.create(req.body);
    
    res.status(201).json({
      success: true,
      data: newPromo
    });

  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: 'كود الخصم موجود بالفعل'
      });
    } else {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};

// الحصول على جميع أكواد الخصم
export const getAllPromoCodes = async (req, res) => {
  try {
    const promoCodes = await PromoCode.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: promoCodes.length,
      data: promoCodes
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};