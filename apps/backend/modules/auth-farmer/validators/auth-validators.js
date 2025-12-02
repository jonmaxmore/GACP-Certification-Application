/**
 * Farmer Authentication Validators
 * Input validation schemas for auth endpoints
 */

const { body } = require('express-validator');

/**
 * Registration validation rules
 */
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('กรุณาใส่อีเมลที่ถูกต้อง'),

  body('password')
    .isLength({ min: 8 })
    .withMessage('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('รหัสผ่านต้องมีตัวพิมพ์เล็ก ตัวพิมพ์ใหญ่ และตัวเลข'),

  body('firstName').trim().isLength({ min: 2 }).withMessage('กรุณาใส่ชื่อ (อย่างน้อย 2 ตัวอักษร)'),

  body('lastName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('กรุณาใส่นามสกุล (อย่างน้อย 2 ตัวอักษร)'),

  body('phoneNumber')
    .isMobilePhone('th-TH')
    .withMessage('กรุณาใส่เบอร์โทรศัพท์มือถือไทยที่ถูกต้อง'),

  body('organizationName')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('ชื่อฟาร์มต้องมีอย่างน้อย 2 ตัวอักษร'),
];

/**
 * Login validation rules
 */
const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('กรุณาใส่อีเมลที่ถูกต้อง'),

  body('password').notEmpty().withMessage('กรุณาใส่รหัสผ่าน'),
];

/**
 * Profile update validation rules
 */
const updateProfileValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('ชื่อต้องมีอย่างน้อย 2 ตัวอักษร'),

  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('นามสกุลต้องมีอย่างน้อย 2 ตัวอักษร'),

  body('phoneNumber')
    .optional()
    .isMobilePhone('th-TH')
    .withMessage('กรุณาใส่เบอร์โทรศัพท์มือถือไทยที่ถูกต้อง'),

  body('organizationName')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('ชื่อฟาร์มต้องมีอย่างน้อย 2 ตัวอักษร'),
];

/**
 * Change password validation rules
 */
const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('กรุณาใส่รหัสผ่านปัจจุบัน'),

  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('รหัสผ่านใหม่ต้องมีตัวพิมพ์เล็ก ตัวพิมพ์ใหญ่ และตัวเลข'),

  body('newPassword')
    .custom((value, { req }) => value !== req.body.currentPassword)
    .withMessage('รหัสผ่านใหม่ต้องแตกต่างจากรหัสผ่านเดิม'),
];

module.exports = {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation,
};
