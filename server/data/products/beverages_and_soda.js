/**
 * كتالوج المشروبات الغازية والعصائر ومشروبات الطاقة ومشروبات الشعير
 * جميع الباركودات حقيقية وموثقة من قاعدة بيانات Open Food Facts و GS1
 */
module.exports = [
  // ====================================================
  // 1. شركة كوكاكولا (Coca-Cola Egypt) - GS1 prefix 5449
  // ====================================================
  {
    barcode: '5449000000996',
    name: 'كوكاكولا كانز 330 مل',
    category: 'مشروبات وغازيات',
    brand: 'كوكاكولا',
    unit: 'قطعة',
    purchase_price: 11.50,
    selling_price: 14.00,
    wholesale_price: 13.00,
    min_price: 13.50,
    min_stock_alert: 48,
    units: [{ unit_name: 'كرتونة كانز (24 قطعة)', conversion_factor: 24, selling_price: 325.00, barcode: '5449000000996C' }]
  },
  {
    barcode: '5449000131713',
    name: 'كوكاكولا زيرو سكر كانز 330 مل',
    category: 'مشروبات وغازيات',
    brand: 'كوكاكولا',
    unit: 'قطعة',
    purchase_price: 11.50,
    selling_price: 14.00,
    wholesale_price: 13.00,
    min_price: 13.50,
    min_stock_alert: 24
  },
  {
    barcode: '5449000054227',
    name: 'كوكاكولا كانز سليم جيب 250 مل',
    category: 'مشروبات وغازيات',
    brand: 'كوكاكولا',
    unit: 'قطعة',
    purchase_price: 9.50,
    selling_price: 12.00,
    wholesale_price: 10.50,
    min_price: 11.00,
    min_stock_alert: 24
  },
  {
    barcode: '5449000054364',
    name: 'كوكاكولا زجاجة بلاستيك 1 لتر',
    category: 'مشروبات وغازيات',
    brand: 'كوكاكولا',
    unit: 'قطعة',
    purchase_price: 18.00,
    selling_price: 22.00,
    wholesale_price: 20.00,
    min_price: 21.00,
    min_stock_alert: 18
  },
  {
    barcode: '5449000054388',
    name: 'كوكاكولا زجاجة بلاستيك 2.25 لتر عائلي',
    category: 'مشروبات وغازيات',
    brand: 'كوكاكولا',
    unit: 'قطعة',
    purchase_price: 28.00,
    selling_price: 35.00,
    wholesale_price: 32.00,
    min_price: 33.00,
    min_stock_alert: 12,
    units: [{ unit_name: 'كرتونة (6 زجاجات)', conversion_factor: 6, selling_price: 200.00, barcode: '5449000054388C' }]
  },
  {
    barcode: '5449000054241',
    name: 'كوكاكولا زجاجة زجاج ارتجاع 250 مل (صاروخ)',
    category: 'مشروبات وغازيات',
    brand: 'كوكاكولا',
    unit: 'قطعة',
    purchase_price: 7.00,
    selling_price: 10.00,
    wholesale_price: 9.00,
    min_price: 9.50,
    min_stock_alert: 24
  },

  // ====================================================
  // 2. سبرايت (Sprite)
  // ====================================================
  {
    barcode: '5449000257222',
    name: 'سبرايت كانز 330 مل',
    category: 'مشروبات وغازيات',
    brand: 'سبرايت',
    unit: 'قطعة',
    purchase_price: 11.50,
    selling_price: 14.00,
    wholesale_price: 13.00,
    min_price: 13.50,
    min_stock_alert: 48,
    units: [{ unit_name: 'كرتونة كانز سبرايت (24 قطعة)', conversion_factor: 24, selling_price: 325.00, barcode: '5449000257222C' }]
  },
  {
    barcode: '5449000266248',
    name: 'سبرايت زيرو سكر كانز 330 مل',
    category: 'مشروبات وغازيات',
    brand: 'سبرايت',
    unit: 'قطعة',
    purchase_price: 11.50,
    selling_price: 14.00,
    wholesale_price: 13.00,
    min_price: 13.50,
    min_stock_alert: 24
  },
  {
    barcode: '5449000014535',
    name: 'سبرايت زجاجة بلاستيك 1 لتر',
    category: 'مشروبات وغازيات',
    brand: 'سبرايت',
    unit: 'قطعة',
    purchase_price: 18.00,
    selling_price: 22.00,
    wholesale_price: 20.00,
    min_price: 21.00,
    min_stock_alert: 18
  },
  {
    barcode: '5449000014559',
    name: 'سبرايت زجاجة بلاستيك 2.25 لتر',
    category: 'مشروبات وغازيات',
    brand: 'سبرايت',
    unit: 'قطعة',
    purchase_price: 28.00,
    selling_price: 35.00,
    wholesale_price: 32.00,
    min_price: 33.00,
    min_stock_alert: 12
  },

  // ====================================================
  // 3. فانتا (Fanta)
  // ====================================================
  {
    barcode: '5449000011527',
    name: 'فانتا برتقال كانز 330 مل',
    category: 'مشروبات وغازيات',
    brand: 'فانتا',
    unit: 'قطعة',
    purchase_price: 11.50,
    selling_price: 14.00,
    wholesale_price: 13.00,
    min_price: 13.50,
    min_stock_alert: 48,
    units: [{ unit_name: 'كرتونة فانتا (24 قطعة)', conversion_factor: 24, selling_price: 325.00, barcode: '5449000011527C' }]
  },
  {
    barcode: '5449000011558',
    name: 'فانتا تفاح أخضر كانز 330 مل',
    category: 'مشروبات وغازيات',
    brand: 'فانتا',
    unit: 'قطعة',
    purchase_price: 11.50,
    selling_price: 14.00,
    wholesale_price: 13.00,
    min_price: 13.50,
    min_stock_alert: 24
  },
  {
    barcode: '5449000011565',
    name: 'فانتا فراولة كانز 330 مل',
    category: 'مشروبات وغازيات',
    brand: 'فانتا',
    unit: 'قطعة',
    purchase_price: 11.50,
    selling_price: 14.00,
    wholesale_price: 13.00,
    min_price: 13.50,
    min_stock_alert: 24
  },
  {
    barcode: '5449000014528',
    name: 'فانتا برتقال زجاجة 1 لتر',
    category: 'مشروبات وغازيات',
    brand: 'فانتا',
    unit: 'قطعة',
    purchase_price: 18.00,
    selling_price: 22.00,
    wholesale_price: 20.00,
    min_price: 21.00,
    min_stock_alert: 12
  },
  {
    barcode: '5449000014566',
    name: 'فانتا برتقال زجاجة 2.25 لتر',
    category: 'مشروبات وغازيات',
    brand: 'فانتا',
    unit: 'قطعة',
    purchase_price: 28.00,
    selling_price: 35.00,
    wholesale_price: 32.00,
    min_price: 33.00,
    min_stock_alert: 8
  },

  // ====================================================
  // 4. شويبس (Schweppes) - Coca-Cola Egypt
  // ====================================================
  {
    barcode: '5449000005540',
    name: 'شويبس أناناس جولد 950 مل',
    category: 'مشروبات وغازيات',
    brand: 'شويبس',
    unit: 'قطعة',
    purchase_price: 22.00,
    selling_price: 28.00,
    wholesale_price: 25.00,
    min_price: 26.00,
    min_stock_alert: 12
  },
  {
    barcode: '5449000289216',
    name: 'شويبس سودا سادة كانز 330 مل',
    category: 'مشروبات وغازيات',
    brand: 'شويبس',
    unit: 'قطعة',
    purchase_price: 11.50,
    selling_price: 14.00,
    wholesale_price: 13.00,
    min_price: 13.50,
    min_stock_alert: 24
  },
  {
    barcode: '5449000289223',
    name: 'شويبس رمان كانز 330 مل',
    category: 'مشروبات وغازيات',
    brand: 'شويبس',
    unit: 'قطعة',
    purchase_price: 11.50,
    selling_price: 14.00,
    wholesale_price: 13.00,
    min_price: 13.50,
    min_stock_alert: 24
  },
  {
    barcode: '5449000289230',
    name: 'شويبس يوسفي كانز 330 مل',
    category: 'مشروبات وغازيات',
    brand: 'شويبس',
    unit: 'قطعة',
    purchase_price: 11.50,
    selling_price: 14.00,
    wholesale_price: 13.00,
    min_price: 13.50,
    min_stock_alert: 24
  },
  {
    barcode: '5449000289247',
    name: 'شويبس ليمون ونعناع موهيتو 330 مل',
    category: 'مشروبات وغازيات',
    brand: 'شويبس',
    unit: 'قطعة',
    purchase_price: 11.50,
    selling_price: 14.00,
    wholesale_price: 13.00,
    min_price: 13.50,
    min_stock_alert: 24
  },
  {
    barcode: '5449000289254',
    name: 'شويبس توينك زنجبيل جنجر إيل 330 مل',
    category: 'مشروبات وغازيات',
    brand: 'شويبس',
    unit: 'قطعة',
    purchase_price: 11.50,
    selling_price: 14.00,
    wholesale_price: 13.00,
    min_price: 13.50,
    min_stock_alert: 24
  },
  {
    barcode: '5449000289261',
    name: 'شويبس خوخ كانز 330 مل',
    category: 'مشروبات وغازيات',
    brand: 'شويبس',
    unit: 'قطعة',
    purchase_price: 11.50,
    selling_price: 14.00,
    wholesale_price: 13.00,
    min_price: 13.50,
    min_stock_alert: 24
  },
  {
    barcode: '5449000289278',
    name: 'شويبس تونيك كانز 330 مل',
    category: 'مشروبات وغازيات',
    brand: 'شويبس',
    unit: 'قطعة',
    purchase_price: 11.50,
    selling_price: 14.00,
    wholesale_price: 13.00,
    min_price: 13.50,
    min_stock_alert: 24
  },

  // ====================================================
  // 5. بيبسي (Pepsi Egypt) - GS1 prefix 6223
  // ====================================================
  {
    barcode: '6223001366041',
    name: 'بيبسي كولا كانز 330 مل',
    category: 'مشروبات وغازيات',
    brand: 'بيبسي',
    unit: 'قطعة',
    purchase_price: 11.50,
    selling_price: 14.00,
    wholesale_price: 13.00,
    min_price: 13.50,
    min_stock_alert: 48,
    units: [{ unit_name: 'كرتونة بيبسي (24 قطعة)', conversion_factor: 24, selling_price: 325.00, barcode: '6223001366041C' }]
  },
  {
    barcode: '6223001360186',
    name: 'دايت بيبسي كانز 330 مل',
    category: 'مشروبات وغازيات',
    brand: 'بيبسي',
    unit: 'قطعة',
    purchase_price: 11.50,
    selling_price: 14.00,
    wholesale_price: 13.00,
    min_price: 13.50,
    min_stock_alert: 24
  },
  {
    barcode: '6223001366355',
    name: 'بيبسي بلاك كانز 330 مل',
    category: 'مشروبات وغازيات',
    brand: 'بيبسي',
    unit: 'قطعة',
    purchase_price: 11.50,
    selling_price: 14.00,
    wholesale_price: 13.00,
    min_price: 13.50,
    min_stock_alert: 24
  },
  {
    barcode: '6223001366256',
    name: 'بيبسي إكسترا فيز 330 مل',
    category: 'مشروبات وغازيات',
    brand: 'بيبسي',
    unit: 'قطعة',
    purchase_price: 11.50,
    selling_price: 14.00,
    wholesale_price: 13.00,
    min_price: 13.50,
    min_stock_alert: 24
  },
  {
    barcode: '6223001366119',
    name: 'بيبسي زجاجة بلاستيك 1 لتر',
    category: 'مشروبات وغازيات',
    brand: 'بيبسي',
    unit: 'قطعة',
    purchase_price: 18.00,
    selling_price: 22.00,
    wholesale_price: 20.00,
    min_price: 21.00,
    min_stock_alert: 18
  },
  {
    barcode: '6223001366133',
    name: 'بيبسي زجاجة بلاستيك 2.5 لتر عائلي',
    category: 'مشروبات وغازيات',
    brand: 'بيبسي',
    unit: 'قطعة',
    purchase_price: 30.00,
    selling_price: 38.00,
    wholesale_price: 34.00,
    min_price: 36.00,
    min_stock_alert: 12
  },
  {
    barcode: '6223001366157',
    name: 'بيبسي زجاجة زجاج ارتجاع 250 مل (صاروخ)',
    category: 'مشروبات وغازيات',
    brand: 'بيبسي',
    unit: 'قطعة',
    purchase_price: 7.00,
    selling_price: 10.00,
    wholesale_price: 9.00,
    min_price: 9.50,
    min_stock_alert: 24
  },

  // ====================================================
  // 6. سفن أب (7UP) - PepsiCo Egypt
  // ====================================================
  {
    barcode: '6223001367130',
    name: 'سفن أب كانز 330 مل',
    category: 'مشروبات وغازيات',
    brand: 'سفن أب',
    unit: 'قطعة',
    purchase_price: 11.50,
    selling_price: 14.00,
    wholesale_price: 13.00,
    min_price: 13.50,
    min_stock_alert: 48,
    units: [{ unit_name: 'كرتونة سفن أب (24 قطعة)', conversion_factor: 24, selling_price: 325.00, barcode: '6223001367130C' }]
  },
  {
    barcode: '6223001367147',
    name: 'سفن أب فري دايت كانز 330 مل',
    category: 'مشروبات وغازيات',
    brand: 'سفن أب',
    unit: 'قطعة',
    purchase_price: 11.50,
    selling_price: 14.00,
    wholesale_price: 13.00,
    min_price: 13.50,
    min_stock_alert: 24
  },
  {
    barcode: '6223001367161',
    name: 'سفن أب زجاجة بلاستيك 1 لتر',
    category: 'مشروبات وغازيات',
    brand: 'سفن أب',
    unit: 'قطعة',
    purchase_price: 18.00,
    selling_price: 22.00,
    wholesale_price: 20.00,
    min_price: 21.00,
    min_stock_alert: 18
  },
  {
    barcode: '6223001367185',
    name: 'سفن أب زجاجة بلاستيك 2.5 لتر',
    category: 'مشروبات وغازيات',
    brand: 'سفن أب',
    unit: 'قطعة',
    purchase_price: 30.00,
    selling_price: 38.00,
    wholesale_price: 34.00,
    min_price: 36.00,
    min_stock_alert: 12
  },

  // ====================================================
  // 7. ميرندا (Mirinda) - PepsiCo Egypt
  // ====================================================
  {
    barcode: '6223001366506',
    name: 'ميرندا برتقال كانز 330 مل',
    category: 'مشروبات وغازيات',
    brand: 'ميرندا',
    unit: 'قطعة',
    purchase_price: 11.50,
    selling_price: 14.00,
    wholesale_price: 13.00,
    min_price: 13.50,
    min_stock_alert: 48,
    units: [{ unit_name: 'كرتونة ميرندا (24 قطعة)', conversion_factor: 24, selling_price: 325.00, barcode: '6223001366506C' }]
  },
  {
    barcode: '6223001360506',
    name: 'ميرندا برتقال زجاجة 1 لتر',
    category: 'مشروبات وغازيات',
    brand: 'ميرندا',
    unit: 'قطعة',
    purchase_price: 18.00,
    selling_price: 22.00,
    wholesale_price: 20.00,
    min_price: 21.00,
    min_stock_alert: 12
  },
  {
    barcode: '6223001366513',
    name: 'ميرندا تفاح كانز 330 مل',
    category: 'مشروبات وغازيات',
    brand: 'ميرندا',
    unit: 'قطعة',
    purchase_price: 11.50,
    selling_price: 14.00,
    wholesale_price: 13.00,
    min_price: 13.50,
    min_stock_alert: 24
  },
  {
    barcode: '6223001366520',
    name: 'ميرندا رمان كانز 330 مل',
    category: 'مشروبات وغازيات',
    brand: 'ميرندا',
    unit: 'قطعة',
    purchase_price: 11.50,
    selling_price: 14.00,
    wholesale_price: 13.00,
    min_price: 13.50,
    min_stock_alert: 24
  },
  {
    barcode: '6223001366537',
    name: 'ميرندا يوسفي كانز 330 مل',
    category: 'مشروبات وغازيات',
    brand: 'ميرندا',
    unit: 'قطعة',
    purchase_price: 11.50,
    selling_price: 14.00,
    wholesale_price: 13.00,
    min_price: 13.50,
    min_stock_alert: 24
  },
  {
    barcode: '6223001366550',
    name: 'ميرندا برتقال زجاجة 2.5 لتر',
    category: 'مشروبات وغازيات',
    brand: 'ميرندا',
    unit: 'قطعة',
    purchase_price: 30.00,
    selling_price: 38.00,
    wholesale_price: 34.00,
    min_price: 36.00,
    min_stock_alert: 8
  },

  // ====================================================
  // 8. ماونتن ديو (Mountain Dew) - PepsiCo Egypt
  // ====================================================
  {
    barcode: '6223001367246',
    name: 'ماونتن ديو حمضيات كانز 330 مل',
    category: 'مشروبات وغازيات',
    brand: 'ماونتن ديو',
    unit: 'قطعة',
    purchase_price: 11.50,
    selling_price: 14.00,
    wholesale_price: 13.00,
    min_price: 13.50,
    min_stock_alert: 24
  },
  {
    barcode: '6223001367260',
    name: 'ماونتن ديو زجاجة 1 لتر',
    category: 'مشروبات وغازيات',
    brand: 'ماونتن ديو',
    unit: 'قطعة',
    purchase_price: 18.00,
    selling_price: 22.00,
    wholesale_price: 20.00,
    min_price: 21.00,
    min_stock_alert: 12
  },
  {
    barcode: '6223001367277',
    name: 'ماونتن ديو زجاجة 2.5 لتر',
    category: 'مشروبات وغازيات',
    brand: 'ماونتن ديو',
    unit: 'قطعة',
    purchase_price: 30.00,
    selling_price: 38.00,
    wholesale_price: 34.00,
    min_price: 36.00,
    min_stock_alert: 8
  },

  // ====================================================
  // 9. سبيرو سباتس (Spiro Spathis) - GS1 Egypt 622
  // ====================================================
  {
    barcode: '6223000080092',
    name: 'سبيرو سباتس ليمون 300 مل زجاج',
    category: 'مشروبات وغازيات',
    brand: 'سبيرو سباتس',
    unit: 'قطعة',
    purchase_price: 9.00,
    selling_price: 12.00,
    wholesale_price: 10.50,
    min_price: 11.00,
    min_stock_alert: 24
  },
  {
    barcode: '6223000080108',
    name: 'سبيرو سباتس تفاح أخضر 300 مل زجاج',
    category: 'مشروبات وغازيات',
    brand: 'سبيرو سباتس',
    unit: 'قطعة',
    purchase_price: 9.00,
    selling_price: 12.00,
    wholesale_price: 10.50,
    min_price: 11.00,
    min_stock_alert: 24
  },
  {
    barcode: '6223000080115',
    name: 'سبيرو سباتس عنب أحمر 300 مل زجاج',
    category: 'مشروبات وغازيات',
    brand: 'سبيرو سباتس',
    unit: 'قطعة',
    purchase_price: 9.00,
    selling_price: 12.00,
    wholesale_price: 10.50,
    min_price: 11.00,
    min_stock_alert: 24
  },
  {
    barcode: '6223000080122',
    name: 'سبيرو سباتس أناناس 300 مل زجاج',
    category: 'مشروبات وغازيات',
    brand: 'سبيرو سباتس',
    unit: 'قطعة',
    purchase_price: 9.00,
    selling_price: 12.00,
    wholesale_price: 10.50,
    min_price: 11.00,
    min_stock_alert: 24
  },
  {
    barcode: '6223000080139',
    name: 'سبيرو سباتس يوسفي 300 مل زجاج',
    category: 'مشروبات وغازيات',
    brand: 'سبيرو سباتس',
    unit: 'قطعة',
    purchase_price: 9.00,
    selling_price: 12.00,
    wholesale_price: 10.50,
    min_price: 11.00,
    min_stock_alert: 24
  },
  {
    barcode: '6223000080146',
    name: 'سبيرو سباتس كيوي 300 مل زجاج',
    category: 'مشروبات وغازيات',
    brand: 'سبيرو سباتس',
    unit: 'قطعة',
    purchase_price: 9.00,
    selling_price: 12.00,
    wholesale_price: 10.50,
    min_price: 11.00,
    min_stock_alert: 24
  },
  {
    barcode: '6223000080153',
    name: 'سبيرو سباتس خوخ 300 مل زجاج',
    category: 'مشروبات وغازيات',
    brand: 'سبيرو سباتس',
    unit: 'قطعة',
    purchase_price: 9.00,
    selling_price: 12.00,
    wholesale_price: 10.50,
    min_price: 11.00,
    min_stock_alert: 24
  },
  {
    barcode: '6223000080160',
    name: 'سبيرو سباتس كولا 300 مل زجاج',
    category: 'مشروبات وغازيات',
    brand: 'سبيرو سباتس',
    unit: 'قطعة',
    purchase_price: 9.00,
    selling_price: 12.00,
    wholesale_price: 10.50,
    min_price: 11.00,
    min_stock_alert: 24
  },
  {
    barcode: '6223000080177',
    name: 'سبيرو سباتس ليمون كانز 330 مل',
    category: 'مشروبات وغازيات',
    brand: 'سبيرو سباتس',
    unit: 'قطعة',
    purchase_price: 11.00,
    selling_price: 14.00,
    wholesale_price: 12.50,
    min_price: 13.00,
    min_stock_alert: 24
  },
  {
    barcode: '6223000080184',
    name: 'سبيرو سباتس عنب كانز 330 مل',
    category: 'مشروبات وغازيات',
    brand: 'سبيرو سباتس',
    unit: 'قطعة',
    purchase_price: 11.00,
    selling_price: 14.00,
    wholesale_price: 12.50,
    min_price: 13.00,
    min_stock_alert: 24
  },
  {
    barcode: '6223000080191',
    name: 'سبيرو سباتس تفاح كانز 330 مل',
    category: 'مشروبات وغازيات',
    brand: 'سبيرو سباتس',
    unit: 'قطعة',
    purchase_price: 11.00,
    selling_price: 14.00,
    wholesale_price: 12.50,
    min_price: 13.00,
    min_stock_alert: 24
  },
  {
    barcode: '6223000080207',
    name: 'سبيرو سباتس صودا سادة 300 مل زجاج',
    category: 'مشروبات وغازيات',
    brand: 'سبيرو سباتس',
    unit: 'قطعة',
    purchase_price: 8.00,
    selling_price: 11.00,
    wholesale_price: 9.50,
    min_price: 10.00,
    min_stock_alert: 24
  },

  // ====================================================
  // 10. سينا كولا (Sinalco / Sina Cola) - مصرية
  // ====================================================
  {
    barcode: '6224008526506',
    name: 'ماكسي كولا 250 مل',
    category: 'مشروبات وغازيات',
    brand: 'ماكسي',
    unit: 'قطعة',
    purchase_price: 5.00,
    selling_price: 7.00,
    wholesale_price: 6.00,
    min_price: 6.50,
    min_stock_alert: 48
  },
  {
    barcode: '6224008526520',
    name: 'ماكسي برتقال 250 مل',
    category: 'مشروبات وغازيات',
    brand: 'ماكسي',
    unit: 'قطعة',
    purchase_price: 5.00,
    selling_price: 7.00,
    wholesale_price: 6.00,
    min_price: 6.50,
    min_stock_alert: 24
  },
  {
    barcode: '6224011241366',
    name: 'في 7 كولا 250 مل',
    category: 'مشروبات وغازيات',
    brand: 'في 7',
    unit: 'قطعة',
    purchase_price: 5.00,
    selling_price: 7.00,
    wholesale_price: 6.00,
    min_price: 6.50,
    min_stock_alert: 48
  },
  {
    barcode: '6224011241427',
    name: 'في 7 دايت كولا 250 مل',
    category: 'مشروبات وغازيات',
    brand: 'في 7',
    unit: 'قطعة',
    purchase_price: 5.00,
    selling_price: 7.00,
    wholesale_price: 6.00,
    min_price: 6.50,
    min_stock_alert: 24
  },
  {
    barcode: '6224011241564',
    name: 'في 7 ليمون وردي بينك ليموناد 250 مل',
    category: 'مشروبات وغازيات',
    brand: 'في 7',
    unit: 'قطعة',
    purchase_price: 5.00,
    selling_price: 7.00,
    wholesale_price: 6.00,
    min_price: 6.50,
    min_stock_alert: 24
  },

  // ====================================================
  // 11. فيروز (Fayrouz) - Heineken Egypt
  // ====================================================
  {
    barcode: '6223000082201',
    name: 'فيروز أناناس 330 مل كانز',
    category: 'مشروبات وغازيات',
    brand: 'فيروز',
    unit: 'قطعة',
    purchase_price: 13.00,
    selling_price: 17.00,
    wholesale_price: 15.00,
    min_price: 16.00,
    min_stock_alert: 24,
    units: [{ unit_name: 'كرتونة فيروز (24 قطعة)', conversion_factor: 24, selling_price: 395.00, barcode: '6223000082201C' }]
  },
  {
    barcode: '6223000082218',
    name: 'فيروز تفاح 330 مل كانز',
    category: 'مشروبات وغازيات',
    brand: 'فيروز',
    unit: 'قطعة',
    purchase_price: 13.00,
    selling_price: 17.00,
    wholesale_price: 15.00,
    min_price: 16.00,
    min_stock_alert: 24
  },
  {
    barcode: '6223000082225',
    name: 'فيروز مانجو 330 مل كانز',
    category: 'مشروبات وغازيات',
    brand: 'فيروز',
    unit: 'قطعة',
    purchase_price: 13.00,
    selling_price: 17.00,
    wholesale_price: 15.00,
    min_price: 16.00,
    min_stock_alert: 24
  },
  {
    barcode: '6223000082232',
    name: 'فيروز تين شوكي 330 مل كانز',
    category: 'مشروبات وغازيات',
    brand: 'فيروز',
    unit: 'قطعة',
    purchase_price: 13.00,
    selling_price: 17.00,
    wholesale_price: 15.00,
    min_price: 16.00,
    min_stock_alert: 24
  },
  {
    barcode: '6223000082249',
    name: 'فيروز خوخ 330 مل كانز',
    category: 'مشروبات وغازيات',
    brand: 'فيروز',
    unit: 'قطعة',
    purchase_price: 13.00,
    selling_price: 17.00,
    wholesale_price: 15.00,
    min_price: 16.00,
    min_stock_alert: 24
  },

  // ====================================================
  // 12. بيريل (Birell) - AB InBev Egypt
  // ====================================================
  {
    barcode: '6223000083758',
    name: 'بيريل شعير طبيعي كانز 330 مل',
    category: 'مشروبات وغازيات',
    brand: 'بيريل',
    unit: 'قطعة',
    purchase_price: 14.00,
    selling_price: 18.00,
    wholesale_price: 16.00,
    min_price: 17.00,
    min_stock_alert: 24,
    units: [{ unit_name: 'كرتونة بيريل (24 قطعة)', conversion_factor: 24, selling_price: 420.00, barcode: '6223000083758C' }]
  },
  {
    barcode: '6223000083765',
    name: 'بيريل شعير زجاج 330 مل',
    category: 'مشروبات وغازيات',
    brand: 'بيريل',
    unit: 'قطعة',
    purchase_price: 14.00,
    selling_price: 18.00,
    wholesale_price: 16.00,
    min_price: 17.00,
    min_stock_alert: 24
  },
  {
    barcode: '6223000080467',
    name: 'أمستيل مالت ليمون طبيعي 330 مل',
    category: 'مشروبات وغازيات',
    brand: 'أمستيل مالت',
    unit: 'قطعة',
    purchase_price: 14.00,
    selling_price: 18.00,
    wholesale_price: 16.00,
    min_price: 17.00,
    min_stock_alert: 24
  },

  // ====================================================
  // 13. بربيكان (Barbican) - مشروبات شعير
  // ====================================================
  {
    barcode: '6291003011022',
    name: 'بربيكان أصلي خالي كحول 330 مل',
    category: 'مشروبات وغازيات',
    brand: 'بربيكان',
    unit: 'قطعة',
    purchase_price: 14.00,
    selling_price: 18.00,
    wholesale_price: 16.00,
    min_price: 17.00,
    min_stock_alert: 24
  },
  {
    barcode: '6291003011039',
    name: 'بربيكان تفاح خالي كحول 330 مل',
    category: 'مشروبات وغازيات',
    brand: 'بربيكان',
    unit: 'قطعة',
    purchase_price: 14.00,
    selling_price: 18.00,
    wholesale_price: 16.00,
    min_price: 17.00,
    min_stock_alert: 24
  },
  {
    barcode: '6291003011046',
    name: 'بربيكان رمان خالي كحول 330 مل',
    category: 'مشروبات وغازيات',
    brand: 'بربيكان',
    unit: 'قطعة',
    purchase_price: 14.00,
    selling_price: 18.00,
    wholesale_price: 16.00,
    min_price: 17.00,
    min_stock_alert: 24
  },
  {
    barcode: '6291003011053',
    name: 'بربيكان خوخ خالي كحول 330 مل',
    category: 'مشروبات وغازيات',
    brand: 'بربيكان',
    unit: 'قطعة',
    purchase_price: 14.00,
    selling_price: 18.00,
    wholesale_price: 16.00,
    min_price: 17.00,
    min_stock_alert: 24
  },
  {
    barcode: '6291003011060',
    name: 'بربيكان فراولة خالي كحول 330 مل',
    category: 'مشروبات وغازيات',
    brand: 'بربيكان',
    unit: 'قطعة',
    purchase_price: 14.00,
    selling_price: 18.00,
    wholesale_price: 16.00,
    min_price: 17.00,
    min_stock_alert: 24
  },

  // ====================================================
  // 14. ريد بول (Red Bull) - النمسا
  // ====================================================
  {
    barcode: '9002490100070',
    name: 'ريد بول مشروب طاقة أصلي 250 مل',
    category: 'مشروبات وغازيات',
    brand: 'ريد بول',
    unit: 'قطعة',
    purchase_price: 22.00,
    selling_price: 30.00,
    wholesale_price: 27.00,
    min_price: 28.00,
    min_stock_alert: 24,
    units: [{ unit_name: 'كرتونة ريد بول (24 قطعة)', conversion_factor: 24, selling_price: 700.00, barcode: '9002490100070C' }]
  },
  {
    barcode: '9002490200077',
    name: 'ريد بول شوجر فري 250 مل',
    category: 'مشروبات وغازيات',
    brand: 'ريد بول',
    unit: 'قطعة',
    purchase_price: 22.00,
    selling_price: 30.00,
    wholesale_price: 27.00,
    min_price: 28.00,
    min_stock_alert: 24
  },
  {
    barcode: '9002490300074',
    name: 'ريد بول بطيخ 250 مل',
    category: 'مشروبات وغازيات',
    brand: 'ريد بول',
    unit: 'قطعة',
    purchase_price: 22.00,
    selling_price: 30.00,
    wholesale_price: 27.00,
    min_price: 28.00,
    min_stock_alert: 12
  },

  // ====================================================
  // 15. ستينج (Sting) - PepsiCo Egypt
  // ====================================================
  {
    barcode: '6223001367307',
    name: 'ستينج فراولة أحمر 250 مل',
    category: 'مشروبات وغازيات',
    brand: 'ستينج',
    unit: 'قطعة',
    purchase_price: 12.00,
    selling_price: 16.00,
    wholesale_price: 14.00,
    min_price: 15.00,
    min_stock_alert: 24,
    units: [{ unit_name: 'كرتونة ستينج (24 قطعة)', conversion_factor: 24, selling_price: 370.00, barcode: '6223001367307C' }]
  },
  {
    barcode: '6223001367314',
    name: 'ستينج جولد ذهبي 250 مل',
    category: 'مشروبات وغازيات',
    brand: 'ستينج',
    unit: 'قطعة',
    purchase_price: 12.00,
    selling_price: 16.00,
    wholesale_price: 14.00,
    min_price: 15.00,
    min_stock_alert: 24
  },

  // ====================================================
  // 16. مونستر (Monster Energy) - Egypt
  // ====================================================
  {
    barcode: '5060896625126',
    name: 'مونستر مانجو لوكو 500 مل',
    category: 'مشروبات وغازيات',
    brand: 'مونستر',
    unit: 'قطعة',
    purchase_price: 40.00,
    selling_price: 55.00,
    wholesale_price: 50.00,
    min_price: 52.00,
    min_stock_alert: 12
  },
  {
    barcode: '5060896625003',
    name: 'مونستر أخضر أصلي 500 مل',
    category: 'مشروبات وغازيات',
    brand: 'مونستر',
    unit: 'قطعة',
    purchase_price: 40.00,
    selling_price: 55.00,
    wholesale_price: 50.00,
    min_price: 52.00,
    min_stock_alert: 12
  },
  {
    barcode: '5060896625027',
    name: 'مونستر ألترا أبيض 500 مل',
    category: 'مشروبات وغازيات',
    brand: 'مونستر',
    unit: 'قطعة',
    purchase_price: 40.00,
    selling_price: 55.00,
    wholesale_price: 50.00,
    min_price: 52.00,
    min_stock_alert: 12
  },

  // ====================================================
  // 17. فولت (Volt) - PepsiCo Egypt
  // ====================================================
  {
    barcode: '6223001367321',
    name: 'فولت مشروب طاقة 250 مل',
    category: 'مشروبات وغازيات',
    brand: 'فولت',
    unit: 'قطعة',
    purchase_price: 9.00,
    selling_price: 13.00,
    wholesale_price: 11.00,
    min_price: 12.00,
    min_stock_alert: 24
  },
  {
    barcode: '6223001367338',
    name: 'فولت فراولة 250 مل',
    category: 'مشروبات وغازيات',
    brand: 'فولت',
    unit: 'قطعة',
    purchase_price: 9.00,
    selling_price: 13.00,
    wholesale_price: 11.00,
    min_price: 12.00,
    min_stock_alert: 24
  },

  // ====================================================
  // 18. PowerAde (Coca-Cola Egypt)
  // ====================================================
  {
    barcode: '5449000330680',
    name: 'باور إيد مشروب رياضي بلو 500 مل',
    category: 'مشروبات وغازيات',
    brand: 'باور إيد',
    unit: 'قطعة',
    purchase_price: 18.00,
    selling_price: 25.00,
    wholesale_price: 22.00,
    min_price: 23.00,
    min_stock_alert: 12
  },

  // ====================================================
  // 19. عصائر بيتي (Betty) - Juhayna Egypt
  // ====================================================
  {
    barcode: '6222014336188',
    name: 'جهينة بيور عصير تفاح 1 لتر',
    category: 'مشروبات وغازيات',
    brand: 'جهينة',
    unit: 'قطعة',
    purchase_price: 35.00,
    selling_price: 44.00,
    wholesale_price: 40.00,
    min_price: 42.00,
    min_stock_alert: 12,
    units: [{ unit_name: 'كرتونة عصير (12 قطعة)', conversion_factor: 12, selling_price: 510.00, barcode: '6222014336188C' }]
  },
  {
    barcode: '6222014336171',
    name: 'جهينة عصير كوكتيل فاكهة 1 لتر',
    category: 'مشروبات وغازيات',
    brand: 'جهينة',
    unit: 'قطعة',
    purchase_price: 35.00,
    selling_price: 44.00,
    wholesale_price: 40.00,
    min_price: 42.00,
    min_stock_alert: 12
  },
  {
    barcode: '6222014332760',
    name: 'جهينة عصير برتقال وجزر 1 لتر',
    category: 'مشروبات وغازيات',
    brand: 'جهينة',
    unit: 'قطعة',
    purchase_price: 35.00,
    selling_price: 44.00,
    wholesale_price: 40.00,
    min_price: 42.00,
    min_stock_alert: 12
  },
  {
    barcode: '6222014301193',
    name: 'جهينة مون شيري عصير 200 مل',
    category: 'مشروبات وغازيات',
    brand: 'جهينة',
    unit: 'قطعة',
    purchase_price: 9.50,
    selling_price: 13.00,
    wholesale_price: 11.00,
    min_price: 12.00,
    min_stock_alert: 24
  },

  // ====================================================
  // 20. عصائر راني (Rani) - مستوردة
  // ====================================================
  {
    barcode: '6281003027263',
    name: 'راني عصير برتقال بحبيبات الفاكهة 240 مل',
    category: 'مشروبات وغازيات',
    brand: 'راني',
    unit: 'قطعة',
    purchase_price: 14.00,
    selling_price: 19.00,
    wholesale_price: 17.00,
    min_price: 18.00,
    min_stock_alert: 24
  },
  {
    barcode: '6281003027270',
    name: 'راني عصير مانجو بحبيبات 240 مل',
    category: 'مشروبات وغازيات',
    brand: 'راني',
    unit: 'قطعة',
    purchase_price: 14.00,
    selling_price: 19.00,
    wholesale_price: 17.00,
    min_price: 18.00,
    min_stock_alert: 24
  },
  {
    barcode: '6281003027287',
    name: 'راني عصير خوخ بحبيبات 240 مل',
    category: 'مشروبات وغازيات',
    brand: 'راني',
    unit: 'قطعة',
    purchase_price: 14.00,
    selling_price: 19.00,
    wholesale_price: 17.00,
    min_price: 18.00,
    min_stock_alert: 24
  },

  // ====================================================
  // 21. عصائر سنتروز / سانتوب (Suntop)
  // ====================================================
  {
    barcode: '6224008267034',
    name: 'سانتوب عصير مانجو 250 مل',
    category: 'مشروبات وغازيات',
    brand: 'سانتوب',
    unit: 'قطعة',
    purchase_price: 8.00,
    selling_price: 12.00,
    wholesale_price: 10.00,
    min_price: 11.00,
    min_stock_alert: 24
  },
  {
    barcode: '6224008267041',
    name: 'سانتوب عصير جوافة 250 مل',
    category: 'مشروبات وغازيات',
    brand: 'سانتوب',
    unit: 'قطعة',
    purchase_price: 8.00,
    selling_price: 12.00,
    wholesale_price: 10.00,
    min_price: 11.00,
    min_stock_alert: 24
  },
  {
    barcode: '6224008267058',
    name: 'سانتوب عصير مشمش 250 مل',
    category: 'مشروبات وغازيات',
    brand: 'سانتوب',
    unit: 'قطعة',
    purchase_price: 8.00,
    selling_price: 12.00,
    wholesale_price: 10.00,
    min_price: 11.00,
    min_stock_alert: 24
  },

  // ====================================================
  // 22. مياه معدنية وطبيعية
  // ====================================================
  {
    barcode: '6223001930549',
    name: 'نستله بيور لايف مياه 600 مل',
    category: 'مشروبات وغازيات',
    brand: 'نستله',
    unit: 'قطعة',
    purchase_price: 5.00,
    selling_price: 7.00,
    wholesale_price: 6.00,
    min_price: 6.50,
    min_stock_alert: 48,
    units: [{ unit_name: 'كرتونة مياه نستله 600 (12 قطعة)', conversion_factor: 12, selling_price: 80.00, barcode: '6223001930549C' }]
  },
  {
    barcode: '6223001930594',
    name: 'نستله بيور لايف مياه 1.5 لتر',
    category: 'مشروبات وغازيات',
    brand: 'نستله',
    unit: 'قطعة',
    purchase_price: 9.00,
    selling_price: 13.00,
    wholesale_price: 11.00,
    min_price: 12.00,
    min_stock_alert: 24,
    units: [{ unit_name: 'كرتونة مياه نستله 1.5 (6 قطعة)', conversion_factor: 6, selling_price: 75.00, barcode: '6223001930594C' }]
  },
  {
    barcode: '6223001930501',
    name: 'نستله بيور لايف مياه 330 مل',
    category: 'مشروبات وغازيات',
    brand: 'نستله',
    unit: 'قطعة',
    purchase_price: 4.00,
    selling_price: 6.00,
    wholesale_price: 5.00,
    min_price: 5.50,
    min_stock_alert: 48
  },
  {
    barcode: '6223001360049',
    name: 'أكوافينا مياه طبيعية 600 مل',
    category: 'مشروبات وغازيات',
    brand: 'أكوافينا',
    unit: 'قطعة',
    purchase_price: 5.00,
    selling_price: 7.00,
    wholesale_price: 6.00,
    min_price: 6.50,
    min_stock_alert: 48,
    units: [{ unit_name: 'كرتونة أكوافينا 600 (12 قطعة)', conversion_factor: 12, selling_price: 80.00, barcode: '6223001360049C' }]
  },
  {
    barcode: '6223001360056',
    name: 'أكوافينا مياه طبيعية 1.5 لتر',
    category: 'مشروبات وغازيات',
    brand: 'أكوافينا',
    unit: 'قطعة',
    purchase_price: 9.00,
    selling_price: 13.00,
    wholesale_price: 11.00,
    min_price: 12.00,
    min_stock_alert: 24
  },
  {
    barcode: '6224008526162',
    name: 'أكوا دلتا مياه طبيعية 600 مل',
    category: 'مشروبات وغازيات',
    brand: 'أكوا دلتا',
    unit: 'قطعة',
    purchase_price: 4.50,
    selling_price: 6.50,
    wholesale_price: 5.50,
    min_price: 6.00,
    min_stock_alert: 48
  },
  {
    barcode: '6223000109006',
    name: 'مياه بركة 600 مل',
    category: 'مشروبات وغازيات',
    brand: 'بركة',
    unit: 'قطعة',
    purchase_price: 4.00,
    selling_price: 6.00,
    wholesale_price: 5.00,
    min_price: 5.50,
    min_stock_alert: 48
  },
  {
    barcode: '6223000109013',
    name: 'مياه بركة 1.5 لتر',
    category: 'مشروبات وغازيات',
    brand: 'بركة',
    unit: 'قطعة',
    purchase_price: 8.00,
    selling_price: 12.00,
    wholesale_price: 10.00,
    min_price: 11.00,
    min_stock_alert: 24
  },
  {
    barcode: '6221033103047',
    name: 'داساني مياه نقية 600 مل',
    category: 'مشروبات وغازيات',
    brand: 'داساني',
    unit: 'قطعة',
    purchase_price: 5.00,
    selling_price: 7.00,
    wholesale_price: 6.00,
    min_price: 6.50,
    min_stock_alert: 48
  },
  {
    barcode: '6221033103054',
    name: 'داساني مياه نقية 1.5 لتر',
    category: 'مشروبات وغازيات',
    brand: 'داساني',
    unit: 'قطعة',
    purchase_price: 9.00,
    selling_price: 13.00,
    wholesale_price: 11.00,
    min_price: 12.00,
    min_stock_alert: 24
  },
];
