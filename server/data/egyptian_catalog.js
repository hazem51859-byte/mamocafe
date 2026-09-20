/**
 * كتالوج المنتجات المصرية الشامل للسوبر ماركت ونقاط البيع (Mamo Cafe & Market)
 * يحتوي على جميع المنتجات المتداولة في السوق المصري بجميع الشركات والأطعم والنكهات:
 * - جميع أنواع الشيبسي والمقرمشات والسناكس والفشار والمكسرات بجميع النكهات
 * - جميع المشروبات الغازية لجميع الشركات (كوكاكولا، بيبسي، سبيرو سباتس، سينا كولا، في 7، شويبس، مشروبات الطاقة والشعير)
 * - جميع أنواع اللبان (ترايدنت، كلورتس، تشكلتس، إكسترا، مينتوس، هولز، سمارة) والشوكولاتة والبسكويت
 * - جميع أنواع السجائر المحلية والمستوردة والمعسلات ومستلزمات التدخين
 * - منتجات الألبان والأجبان، السلع التموينية، المعلبات، إندومي بجميع أطعمته، المنظفات، والعناية الشخصية
 * 
 * جميع المنتجات معرّفة بالباركود الدولي وسعر الشراء وسعر البيع المقترح
 * الأرصدة الافتتاحية للمخزون مضبوطة على صفر (0) لتكون جاهزة للجرد وإدخال الكميات
 */

const categories = require('./categories');
const brands = require('./brands');

// استيراد الأقسام المعيارية المتخصصة
const chipsAndSnacks = require('./products/chips_and_snacks');
const beveragesAndSoda = require('./products/beverages_and_soda');
const gumAndSweets = require('./products/gum_and_sweets');
const tobacco = require('./products/tobacco');
const groceriesDairyCanned = require('./products/groceries_dairy_canned');

// تجميع كل المنتجات في قائمة موحدة شاملة
const products = [
  ...chipsAndSnacks,
  ...beveragesAndSoda,
  ...gumAndSweets,
  ...tobacco,
  ...groceriesDairyCanned
];

module.exports = {
  categories,
  brands,
  products
};
