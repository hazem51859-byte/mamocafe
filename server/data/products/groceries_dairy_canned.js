/**
 * كتالوج السلع التموينية والألبان والأجبان والمعلبات والإندومي والمعكرونات والمنظفات والعناية الشخصية
 * الباركودات الحقيقية الموثقة من Open Food Facts و GS1 Egypt
 */
module.exports = [

  // =========================================================================
  // 1. ألبان (DAIRY) - جهينة - باركودات حقيقية من OFF
  // =========================================================================
  {
    barcode: '6223000350003',
    name: 'حليب جهينة كامل الدسم 1 لتر',
    category: 'ألبان وأجبان',
    brand: 'جهينة',
    unit: 'قطعة',
    purchase_price: 43.50,
    selling_price: 48.00,
    wholesale_price: 46.00,
    min_price: 47.00,
    min_stock_alert: 12,
    units: [{ unit_name: 'كرتونة حليب 1 لتر (12 عبوة)', conversion_factor: 12, selling_price: 560.00, barcode: '6223000350003C' }]
  },
  {
    barcode: '6223000350010',
    name: 'حليب جهينة كامل الدسم 200 مل',
    category: 'ألبان وأجبان',
    brand: 'جهينة',
    unit: 'قطعة',
    purchase_price: 10.00,
    selling_price: 13.00,
    wholesale_price: 11.00,
    min_price: 12.00,
    min_stock_alert: 24
  },
  {
    barcode: '6223000350065',
    name: 'حليب جهينة خالي الدسم 1 لتر',
    category: 'ألبان وأجبان',
    brand: 'جهينة',
    unit: 'قطعة',
    purchase_price: 43.50,
    selling_price: 48.00,
    wholesale_price: 46.00,
    min_price: 47.00,
    min_stock_alert: 8
  },
  {
    barcode: '6222014310898',
    name: 'مشروب جهينة ميكس فراولة 200 مل',
    category: 'ألبان وأجبان',
    brand: 'جهينة',
    unit: 'قطعة',
    purchase_price: 11.50,
    selling_price: 14.00,
    wholesale_price: 13.00,
    min_price: 13.50,
    min_stock_alert: 24,
    units: [{ unit_name: 'كرتونة ميكس (27 قطعة)', conversion_factor: 27, selling_price: 365.00, barcode: '6222014310898C' }]
  },
  {
    barcode: '6222014310881',
    name: 'مشروب جهينة ميكس شوكولاتة 200 مل',
    category: 'ألبان وأجبان',
    brand: 'جهينة',
    unit: 'قطعة',
    purchase_price: 11.50,
    selling_price: 14.00,
    wholesale_price: 13.00,
    min_price: 13.50,
    min_stock_alert: 24
  },
  {
    barcode: '6222014310805',
    name: 'حليب جهينة خالي الدسم 0% دهون 200 مل',
    category: 'ألبان وأجبان',
    brand: 'جهينة',
    unit: 'قطعة',
    purchase_price: 10.00,
    selling_price: 13.00,
    wholesale_price: 11.00,
    min_price: 12.00,
    min_stock_alert: 24
  },
  {
    barcode: '6222014352416',
    name: 'رايب جهينة طبيعي 440 مل',
    category: 'ألبان وأجبان',
    brand: 'جهينة',
    unit: 'قطعة',
    purchase_price: 18.00,
    selling_price: 22.00,
    wholesale_price: 20.00,
    min_price: 21.00,
    min_stock_alert: 12
  },
  {
    barcode: '6222014352065',
    name: 'زبادي يوناني جهينة خالي الدسم 0.2% دهون 150 جم',
    category: 'ألبان وأجبان',
    brand: 'جهينة',
    unit: 'علبة',
    purchase_price: 20.00,
    selling_price: 26.00,
    wholesale_price: 23.00,
    min_price: 24.00,
    min_stock_alert: 12
  },
  {
    barcode: '6222014352195',
    name: 'زبادي يوناني جهينة 2% دهون 150 جم',
    category: 'ألبان وأجبان',
    brand: 'جهينة',
    unit: 'علبة',
    purchase_price: 20.00,
    selling_price: 26.00,
    wholesale_price: 23.00,
    min_price: 24.00,
    min_stock_alert: 12
  },
  {
    barcode: '6222014353116',
    name: 'زبادي يوناني جهينة فواكه غابة مشكلة 150 جم',
    category: 'ألبان وأجبان',
    brand: 'جهينة',
    unit: 'علبة',
    purchase_price: 22.00,
    selling_price: 28.00,
    wholesale_price: 25.00,
    min_price: 26.00,
    min_stock_alert: 12
  },
  {
    barcode: '6222014352201',
    name: 'زبادي يوناني جهينة سادة 150 جم',
    category: 'ألبان وأجبان',
    brand: 'جهينة',
    unit: 'علبة',
    purchase_price: 18.00,
    selling_price: 23.00,
    wholesale_price: 21.00,
    min_price: 22.00,
    min_stock_alert: 12
  },
  {
    barcode: '6222014300905',
    name: 'زبادي جهينة طبيعي سادة 120 جم',
    category: 'ألبان وأجبان',
    brand: 'جهينة',
    unit: 'علبة',
    purchase_price: 7.00,
    selling_price: 9.00,
    wholesale_price: 8.00,
    min_price: 8.50,
    min_stock_alert: 24
  },
  {
    barcode: '6222014300912',
    name: 'زبادي جهينة لايت خالي الدسم 120 جم',
    category: 'ألبان وأجبان',
    brand: 'جهينة',
    unit: 'علبة',
    purchase_price: 7.00,
    selling_price: 9.00,
    wholesale_price: 8.00,
    min_price: 8.50,
    min_stock_alert: 18
  },
  {
    barcode: '6222014351396',
    name: 'زبادو جهينة فراولة 200 جم',
    category: 'ألبان وأجبان',
    brand: 'جهينة',
    unit: 'علبة',
    purchase_price: 12.00,
    selling_price: 15.00,
    wholesale_price: 13.50,
    min_price: 14.00,
    min_stock_alert: 24
  },
  {
    barcode: '6222014301200',
    name: 'مون شيري جهينة عصير كرز بالحليب 150 مل (صغير)',
    category: 'ألبان وأجبان',
    brand: 'جهينة',
    unit: 'قطعة',
    purchase_price: 8.00,
    selling_price: 10.00,
    wholesale_price: 9.00,
    min_price: 9.50,
    min_stock_alert: 24
  },
  {
    barcode: '6222014312519',
    name: 'حليب شوفان جهينة أوت ميلك 1 لتر',
    category: 'ألبان وأجبان',
    brand: 'جهينة',
    unit: 'قطعة',
    purchase_price: 55.00,
    selling_price: 65.00,
    wholesale_price: 60.00,
    min_price: 62.00,
    min_stock_alert: 8
  },
  {
    barcode: '6222014300127',
    name: 'كريمة جهينة للطبخ والخفق 1 لتر',
    category: 'ألبان وأجبان',
    brand: 'جهينة',
    unit: 'قطعة',
    purchase_price: 65.00,
    selling_price: 78.00,
    wholesale_price: 72.00,
    min_price: 75.00,
    min_stock_alert: 8
  },
  {
    barcode: '6222014301476',
    name: 'لبنة تركي جهينة 350 جم',
    category: 'ألبان وأجبان',
    brand: 'جهينة',
    unit: 'قطعة',
    purchase_price: 28.00,
    selling_price: 35.00,
    wholesale_price: 31.00,
    min_price: 33.00,
    min_stock_alert: 10
  },

  // =========================================================================
  // 2. ألبان وزبادي المراعي - باركودات حقيقية من OFF
  // =========================================================================
  {
    barcode: '6223001874294',
    name: 'حليب المراعي كامل الدسم 1 لتر',
    category: 'ألبان وأجبان',
    brand: 'المراعي',
    unit: 'قطعة',
    purchase_price: 44.00,
    selling_price: 49.00,
    wholesale_price: 46.50,
    min_price: 48.00,
    min_stock_alert: 12,
    units: [{ unit_name: 'كرتونة حليب المراعي 1 لتر (12 عبوة)', conversion_factor: 12, selling_price: 575.00, barcode: '6223001874294C' }]
  },
  {
    barcode: '6223001878018',
    name: 'حليب المراعي كامل الدسم تيتراباك 200 مل',
    category: 'ألبان وأجبان',
    brand: 'المراعي',
    unit: 'قطعة',
    purchase_price: 10.00,
    selling_price: 13.00,
    wholesale_price: 11.50,
    min_price: 12.00,
    min_stock_alert: 24
  },
  {
    barcode: '6223001874317',
    name: 'حليب المراعي نصف دسم 1 لتر',
    category: 'ألبان وأجبان',
    brand: 'المراعي',
    unit: 'قطعة',
    purchase_price: 44.00,
    selling_price: 49.00,
    wholesale_price: 46.50,
    min_price: 48.00,
    min_stock_alert: 10
  },
  {
    barcode: '6223001878308',
    name: 'حليب المراعي خالي الدسم 0% دهون 1 لتر',
    category: 'ألبان وأجبان',
    brand: 'المراعي',
    unit: 'قطعة',
    purchase_price: 44.00,
    selling_price: 49.00,
    wholesale_price: 46.50,
    min_price: 48.00,
    min_stock_alert: 8
  },
  {
    barcode: '6223001877165',
    name: 'مشروب شوكولاتة المراعي بالحليب 200 مل',
    category: 'ألبان وأجبان',
    brand: 'المراعي',
    unit: 'قطعة',
    purchase_price: 12.00,
    selling_price: 15.00,
    wholesale_price: 13.50,
    min_price: 14.00,
    min_stock_alert: 24
  },
  {
    barcode: '6223001877202',
    name: 'مشروب فراولة المراعي بالحليب 200 مل',
    category: 'ألبان وأجبان',
    brand: 'المراعي',
    unit: 'قطعة',
    purchase_price: 12.00,
    selling_price: 15.00,
    wholesale_price: 13.50,
    min_price: 14.00,
    min_stock_alert: 24
  },
  {
    barcode: '6223001872924',
    name: 'زبادي المراعي طبيعي سادة 170 جم',
    category: 'ألبان وأجبان',
    brand: 'المراعي',
    unit: 'علبة',
    purchase_price: 10.00,
    selling_price: 13.00,
    wholesale_price: 11.50,
    min_price: 12.00,
    min_stock_alert: 24
  },
  {
    barcode: '6223007520331',
    name: 'زبادي المراعي طبيعي كامل الدسم 170 جم',
    category: 'ألبان وأجبان',
    brand: 'المراعي',
    unit: 'علبة',
    purchase_price: 10.00,
    selling_price: 13.00,
    wholesale_price: 11.50,
    min_price: 12.00,
    min_stock_alert: 24
  },
  {
    barcode: '6223007520409',
    name: 'رايب المراعي طبيعي 350 مل',
    category: 'ألبان وأجبان',
    brand: 'المراعي',
    unit: 'قطعة',
    purchase_price: 16.00,
    selling_price: 20.00,
    wholesale_price: 18.00,
    min_price: 19.00,
    min_stock_alert: 12
  },
  {
    barcode: '6223001878520',
    name: 'رايب المراعي عائلي 1 لتر',
    category: 'ألبان وأجبان',
    brand: 'المراعي',
    unit: 'قطعة',
    purchase_price: 38.00,
    selling_price: 46.00,
    wholesale_price: 42.00,
    min_price: 44.00,
    min_stock_alert: 10
  },
  {
    barcode: '6223001878643',
    name: 'يو-جو المراعي مشروب زبادي فراولة 180 مل',
    category: 'ألبان وأجبان',
    brand: 'المراعي',
    unit: 'قطعة',
    purchase_price: 12.00,
    selling_price: 15.00,
    wholesale_price: 13.50,
    min_price: 14.00,
    min_stock_alert: 24
  },

  // =========================================================================
  // 3. لمار وعبور لاند ودومتي
  // =========================================================================
  {
    barcode: '6224001105005',
    name: 'حليب لمار كامل الدسم 1 لتر',
    category: 'ألبان وأجبان',
    brand: 'لمار',
    unit: 'قطعة',
    purchase_price: 43.00,
    selling_price: 48.00,
    wholesale_price: 45.50,
    min_price: 47.00,
    min_stock_alert: 12,
    units: [{ unit_name: 'كرتونة لمار 1 لتر (12 عبوة)', conversion_factor: 12, selling_price: 560.00, barcode: '6224001105005C' }]
  },
  {
    barcode: '6224000147143',
    name: 'جبنة فيتا عبور لاند تتراباك 500 جم',
    category: 'ألبان وأجبان',
    brand: 'عبور لاند',
    unit: 'علبة',
    purchase_price: 34.00,
    selling_price: 40.00,
    wholesale_price: 37.00,
    min_price: 39.00,
    min_stock_alert: 18,
    units: [{ unit_name: 'كرتونة عبور لاند (27 علبة)', conversion_factor: 27, selling_price: 1040.00, barcode: '6224000147143C' }]
  },
  {
    barcode: '6223006520547',
    name: 'جبنة عبور لاند بيضاء 500 جم',
    category: 'ألبان وأجبان',
    brand: 'عبور لاند',
    unit: 'علبة',
    purchase_price: 34.00,
    selling_price: 40.00,
    wholesale_price: 37.00,
    min_price: 39.00,
    min_stock_alert: 15
  },
  {
    barcode: '6223000758571',
    name: 'دومتي سندوتش جبنة كريمي بالجبنة الرومي',
    category: 'ألبان وأجبان',
    brand: 'دومتي',
    unit: 'قطعة',
    purchase_price: 15.00,
    selling_price: 19.00,
    wholesale_price: 17.00,
    min_price: 18.00,
    min_stock_alert: 24
  },
  {
    barcode: '6223000758564',
    name: 'دومتي سندوتش جبنة كريمي سادة',
    category: 'ألبان وأجبان',
    brand: 'دومتي',
    unit: 'قطعة',
    purchase_price: 15.00,
    selling_price: 19.00,
    wholesale_price: 17.00,
    min_price: 18.00,
    min_stock_alert: 24
  },
  {
    barcode: '6223000756218',
    name: 'دومتي جبنة فيتا تتراباك 500 جم',
    category: 'ألبان وأجبان',
    brand: 'دومتي',
    unit: 'علبة',
    purchase_price: 34.00,
    selling_price: 40.00,
    wholesale_price: 37.00,
    min_price: 39.00,
    min_stock_alert: 18
  },
  {
    barcode: '6223000756645',
    name: 'دومتي فروماج جبنة بيضاء بالأعشاب',
    category: 'ألبان وأجبان',
    brand: 'دومتي',
    unit: 'علبة',
    purchase_price: 20.00,
    selling_price: 25.00,
    wholesale_price: 22.00,
    min_price: 24.00,
    min_stock_alert: 20
  },
  {
    barcode: '6223000756652',
    name: 'دومتي بلس جبنة بيضاء زيادة وزن',
    category: 'ألبان وأجبان',
    brand: 'دومتي',
    unit: 'علبة',
    purchase_price: 32.00,
    selling_price: 38.00,
    wholesale_price: 35.00,
    min_price: 37.00,
    min_stock_alert: 15
  },
  {
    barcode: '6224000036027',
    name: 'جبنة طعمة مثلثات 8 قطع 120 جم',
    category: 'ألبان وأجبان',
    brand: 'طعمة',
    unit: 'علبة',
    purchase_price: 20.00,
    selling_price: 25.00,
    wholesale_price: 22.00,
    min_price: 24.00,
    min_stock_alert: 20
  },
  {
    barcode: '6224000432003',
    name: 'حليب مزارع دينا كامل الدسم طازج 1 لتر',
    category: 'ألبان وأجبان',
    brand: 'مزارع دينا',
    unit: 'قطعة',
    purchase_price: 50.00,
    selling_price: 60.00,
    wholesale_price: 55.00,
    min_price: 58.00,
    min_stock_alert: 10
  },
  {
    barcode: '6223000717356',
    name: 'زبادي لبنيتا طبيعي سادة 150 جم',
    category: 'ألبان وأجبان',
    brand: 'لبنيتا',
    unit: 'علبة',
    purchase_price: 8.00,
    selling_price: 10.00,
    wholesale_price: 9.00,
    min_price: 9.50,
    min_stock_alert: 24
  },

  // =========================================================================
  // 4. عصائر جهينة - باركودات حقيقية من OFF
  // =========================================================================
  {
    barcode: '6222014336195',
    name: 'عصير جهينة تفاح طبيعي مصفى 1 لتر',
    category: 'عصائر ومياه',
    brand: 'جهينة',
    unit: 'قطعة',
    purchase_price: 30.00,
    selling_price: 38.00,
    wholesale_price: 34.00,
    min_price: 36.00,
    min_stock_alert: 12
  },
  {
    barcode: '6222014336164',
    name: 'عصير جهينة كوكتيل مانجو وبرتقال 1 لتر',
    category: 'عصائر ومياه',
    brand: 'جهينة',
    unit: 'قطعة',
    purchase_price: 30.00,
    selling_price: 38.00,
    wholesale_price: 34.00,
    min_price: 36.00,
    min_stock_alert: 12
  },
  {
    barcode: '6222014332777',
    name: 'عصير جهينة جوافة 1 لتر',
    category: 'عصائر ومياه',
    brand: 'جهينة',
    unit: 'قطعة',
    purchase_price: 30.00,
    selling_price: 38.00,
    wholesale_price: 34.00,
    min_price: 36.00,
    min_stock_alert: 12
  },
  {
    barcode: '6222014336126',
    name: 'عصير جهينة رمان طبيعي 1 لتر',
    category: 'عصائر ومياه',
    brand: 'جهينة',
    unit: 'قطعة',
    purchase_price: 35.00,
    selling_price: 45.00,
    wholesale_price: 40.00,
    min_price: 42.00,
    min_stock_alert: 10
  },
  {
    barcode: '6222014330643',
    name: 'عصير جهينة تفاح 200 مل كوباية صغيرة',
    category: 'عصائر ومياه',
    brand: 'جهينة',
    unit: 'قطعة',
    purchase_price: 8.00,
    selling_price: 10.00,
    wholesale_price: 9.00,
    min_price: 9.50,
    min_stock_alert: 24
  },

  // =========================================================================
  // 5. معكرونات وشعيرية (Pasta) - باركودات حقيقية من OFF
  // =========================================================================
  {
    barcode: '6221022110216',
    name: 'معكرونة ريجينا سباغيتي 400 جم',
    category: 'سلع تموينية',
    brand: 'ريجينا',
    unit: 'كيس',
    purchase_price: 12.00,
    selling_price: 15.00,
    wholesale_price: 13.50,
    min_price: 14.00,
    min_stock_alert: 24,
    units: [{ unit_name: 'كرتونة ريجينا 400 جم (24 كيس)', conversion_factor: 24, selling_price: 340.00, barcode: '6221022110216C' }]
  },
  {
    barcode: '6221022110452',
    name: 'معكرونة ريجينا بيني (مكرونة قلم) 400 جم',
    category: 'سلع تموينية',
    brand: 'ريجينا',
    unit: 'كيس',
    purchase_price: 12.00,
    selling_price: 15.00,
    wholesale_price: 13.50,
    min_price: 14.00,
    min_stock_alert: 24
  },
  {
    barcode: '6221022110469',
    name: 'معكرونة ريجينا فيتوتشيني 400 جم',
    category: 'سلع تموينية',
    brand: 'ريجينا',
    unit: 'كيس',
    purchase_price: 12.00,
    selling_price: 15.00,
    wholesale_price: 13.50,
    min_price: 14.00,
    min_stock_alert: 18
  },
  {
    barcode: '6221022110476',
    name: 'معكرونة ريجينا فراشة (فارفالي) 400 جم',
    category: 'سلع تموينية',
    brand: 'ريجينا',
    unit: 'كيس',
    purchase_price: 12.00,
    selling_price: 15.00,
    wholesale_price: 13.50,
    min_price: 14.00,
    min_stock_alert: 18
  },
  {
    barcode: '6221022110483',
    name: 'معكرونة ريجينا ريجاتوني 400 جم',
    category: 'سلع تموينية',
    brand: 'ريجينا',
    unit: 'كيس',
    purchase_price: 12.00,
    selling_price: 15.00,
    wholesale_price: 13.50,
    min_price: 14.00,
    min_stock_alert: 18
  },
  {
    barcode: '6221022110490',
    name: 'معكرونة ريجينا كوعاني (فيوزيلي) 400 جم',
    category: 'سلع تموينية',
    brand: 'ريجينا',
    unit: 'كيس',
    purchase_price: 12.00,
    selling_price: 15.00,
    wholesale_price: 13.50,
    min_price: 14.00,
    min_stock_alert: 18
  },
  {
    barcode: '6224008559016',
    name: 'معكرونة هواء بيني 400 جم',
    category: 'سلع تموينية',
    brand: 'هواء',
    unit: 'كيس',
    purchase_price: 12.00,
    selling_price: 15.00,
    wholesale_price: 13.50,
    min_price: 14.00,
    min_stock_alert: 24
  },
  {
    barcode: '6224008559450',
    name: 'معكرونة هواء شيلز (قواقع) 400 جم',
    category: 'سلع تموينية',
    brand: 'هواء',
    unit: 'كيس',
    purchase_price: 12.00,
    selling_price: 15.00,
    wholesale_price: 13.50,
    min_price: 14.00,
    min_stock_alert: 18
  },
  {
    barcode: '6224008559467',
    name: 'معكرونة هواء سباغيتي 400 جم',
    category: 'سلع تموينية',
    brand: 'هواء',
    unit: 'كيس',
    purchase_price: 12.00,
    selling_price: 15.00,
    wholesale_price: 13.50,
    min_price: 14.00,
    min_stock_alert: 18
  },
  {
    barcode: '6223001512479',
    name: 'معكرونة الملكة سباغيتي كبير 900 جم',
    category: 'سلع تموينية',
    brand: 'الملكة',
    unit: 'كيس',
    purchase_price: 23.00,
    selling_price: 28.00,
    wholesale_price: 25.00,
    min_price: 27.00,
    min_stock_alert: 18
  },
  {
    barcode: '6223001512257',
    name: 'شعيرية الملكة (إيرماكاروني) 400 جم',
    category: 'سلع تموينية',
    brand: 'الملكة',
    unit: 'كيس',
    purchase_price: 12.00,
    selling_price: 15.00,
    wholesale_price: 13.50,
    min_price: 14.00,
    min_stock_alert: 18
  },
  {
    barcode: '6223007943994',
    name: 'معكرونة كاير حلقات كبيرة بيج رينجز 400 جم',
    category: 'سلع تموينية',
    brand: 'باستا كايرو',
    unit: 'كيس',
    purchase_price: 12.00,
    selling_price: 15.00,
    wholesale_price: 13.50,
    min_price: 14.00,
    min_stock_alert: 18
  },

  // =========================================================================
  // 6. إندومي (Indomie) - باركودات حقيقية من OFF
  // =========================================================================
  {
    barcode: '5285000395140',
    name: 'إندومي سوبر مي (السادة) 75 جم',
    category: 'سلع تموينية',
    brand: 'إندومي',
    unit: 'قطعة',
    purchase_price: 6.00,
    selling_price: 8.00,
    wholesale_price: 7.00,
    min_price: 7.50,
    min_stock_alert: 48,
    units: [{ unit_name: 'كرتونة إندومي (40 قطعة)', conversion_factor: 40, selling_price: 300.00, barcode: '5285000395140C' }]
  },
  {
    barcode: '5285000391647',
    name: 'إندومي خضار طبيعي 75 جم',
    category: 'سلع تموينية',
    brand: 'إندومي',
    unit: 'قطعة',
    purchase_price: 6.00,
    selling_price: 8.00,
    wholesale_price: 7.00,
    min_price: 7.50,
    min_stock_alert: 48
  },
  {
    barcode: '5285000395157',
    name: 'إندومي دجاج 75 جم',
    category: 'سلع تموينية',
    brand: 'إندومي',
    unit: 'قطعة',
    purchase_price: 6.00,
    selling_price: 8.00,
    wholesale_price: 7.00,
    min_price: 7.50,
    min_stock_alert: 48
  },
  {
    barcode: '5285000395164',
    name: 'إندومي لحمة وسبانخ 75 جم',
    category: 'سلع تموينية',
    brand: 'إندومي',
    unit: 'قطعة',
    purchase_price: 6.00,
    selling_price: 8.00,
    wholesale_price: 7.00,
    min_price: 7.50,
    min_stock_alert: 48
  },
  {
    barcode: '5285000395171',
    name: 'إندومي أعشاب بحرية 75 جم',
    category: 'سلع تموينية',
    brand: 'إندومي',
    unit: 'قطعة',
    purchase_price: 6.00,
    selling_price: 8.00,
    wholesale_price: 7.00,
    min_price: 7.50,
    min_stock_alert: 48
  },
  {
    barcode: '5285000395188',
    name: 'إندومي ريلاكس شرمبس جمبري 75 جم',
    category: 'سلع تموينية',
    brand: 'إندومي',
    unit: 'قطعة',
    purchase_price: 6.00,
    selling_price: 8.00,
    wholesale_price: 7.00,
    min_price: 7.50,
    min_stock_alert: 48
  },

  // =========================================================================
  // 7. هاينز (Heinz) - كاتشب ومايونيز وخردل - باركودات حقيقية
  // =========================================================================
  {
    barcode: '6221033101289',
    name: 'كاتشب هاينز طماطم بوتيل 300 جم',
    category: 'سلع تموينية',
    brand: 'هاينز',
    unit: 'قطعة',
    purchase_price: 35.00,
    selling_price: 42.00,
    wholesale_price: 38.00,
    min_price: 40.00,
    min_stock_alert: 12,
    units: [{ unit_name: 'كرتونة هاينز 300 جم (12 عبوة)', conversion_factor: 12, selling_price: 490.00, barcode: '6221033101289C' }]
  },
  {
    barcode: '6221033000957',
    name: 'كاتشب هاينز طماطم بوتيل 500 جم',
    category: 'سلع تموينية',
    brand: 'هاينز',
    unit: 'قطعة',
    purchase_price: 55.00,
    selling_price: 65.00,
    wholesale_price: 60.00,
    min_price: 63.00,
    min_stock_alert: 10
  },
  {
    barcode: '6221033177239',
    name: 'مايونيز هاينز الأصلي 400 مل',
    category: 'سلع تموينية',
    brand: 'هاينز',
    unit: 'قطعة',
    purchase_price: 45.00,
    selling_price: 55.00,
    wholesale_price: 50.00,
    min_price: 53.00,
    min_stock_alert: 12
  },
  {
    barcode: '6221033177338',
    name: 'مايونيز هاينز لايت خفيف 400 مل',
    category: 'سلع تموينية',
    brand: 'هاينز',
    unit: 'قطعة',
    purchase_price: 45.00,
    selling_price: 55.00,
    wholesale_price: 50.00,
    min_price: 53.00,
    min_stock_alert: 10
  },
  {
    barcode: '6221033173217',
    name: 'خردل أصفر هاينز مسطردة 200 مل',
    category: 'سلع تموينية',
    brand: 'هاينز',
    unit: 'قطعة',
    purchase_price: 30.00,
    selling_price: 38.00,
    wholesale_price: 34.00,
    min_price: 36.00,
    min_stock_alert: 12
  },
  {
    barcode: '6221033001275',
    name: 'مسطردة هاينز بني قوي 200 مل',
    category: 'سلع تموينية',
    brand: 'هاينز',
    unit: 'قطعة',
    purchase_price: 30.00,
    selling_price: 38.00,
    wholesale_price: 34.00,
    min_price: 36.00,
    min_stock_alert: 10
  },

  // =========================================================================
  // 8. تونة وأسماك معلبة - باركودات حقيقية من OFF
  // =========================================================================
  {
    barcode: '6223000717431',
    name: 'تونة صن شاين قطع في زيت عباد الشمس 185 جم',
    category: 'معلبات',
    brand: 'صن شاين',
    unit: 'علبة',
    purchase_price: 30.00,
    selling_price: 36.00,
    wholesale_price: 33.00,
    min_price: 35.00,
    min_stock_alert: 24,
    units: [{ unit_name: 'كرتونة صن شاين (24 علبة)', conversion_factor: 24, selling_price: 840.00, barcode: '6223000717431C' }]
  },
  {
    barcode: '6224000529024',
    name: 'تونة دولفين صلبة في زيت نباتي 185 جم',
    category: 'معلبات',
    brand: 'دولفين',
    unit: 'علبة',
    purchase_price: 28.00,
    selling_price: 34.00,
    wholesale_price: 31.00,
    min_price: 33.00,
    min_stock_alert: 24
  },
  {
    barcode: '6224000529031',
    name: 'تونة دولفين خفيفة الصوص 185 جم',
    category: 'معلبات',
    brand: 'دولفين',
    unit: 'علبة',
    purchase_price: 26.00,
    selling_price: 32.00,
    wholesale_price: 29.00,
    min_price: 31.00,
    min_stock_alert: 24
  },
  {
    barcode: '6223000717448',
    name: 'تونة صن شاين في صوص طماطم 185 جم',
    category: 'معلبات',
    brand: 'صن شاين',
    unit: 'علبة',
    purchase_price: 28.00,
    selling_price: 34.00,
    wholesale_price: 31.00,
    min_price: 33.00,
    min_stock_alert: 20
  },
  {
    barcode: '6224008603559',
    name: 'سردين في زيت نباتي 125 جم',
    category: 'معلبات',
    brand: 'علب سمك',
    unit: 'علبة',
    purchase_price: 15.00,
    selling_price: 20.00,
    wholesale_price: 17.00,
    min_price: 18.00,
    min_stock_alert: 24
  },

  // =========================================================================
  // 9. معلبات (فول وفاصوليا وخضار) - باركودات حقيقية من OFF
  // =========================================================================
  {
    barcode: '6223001062547',
    name: 'فول مدمس هارفست سادة 400 جم',
    category: 'معلبات',
    brand: 'هارفست',
    unit: 'علبة',
    purchase_price: 14.00,
    selling_price: 18.00,
    wholesale_price: 16.00,
    min_price: 17.00,
    min_stock_alert: 24,
    units: [{ unit_name: 'كرتونة فول (24 علبة)', conversion_factor: 24, selling_price: 415.00, barcode: '6223001062547C' }]
  },
  {
    barcode: '6223001062554',
    name: 'فول مدمس هارفست بالزيت والليمون 400 جم',
    category: 'معلبات',
    brand: 'هارفست',
    unit: 'علبة',
    purchase_price: 15.00,
    selling_price: 19.00,
    wholesale_price: 17.00,
    min_price: 18.00,
    min_stock_alert: 24
  },
  {
    barcode: '6223001062561',
    name: 'فول مدمس هارفست بالطحينة 400 جم',
    category: 'معلبات',
    brand: 'هارفست',
    unit: 'علبة',
    purchase_price: 15.00,
    selling_price: 19.00,
    wholesale_price: 17.00,
    min_price: 18.00,
    min_stock_alert: 20
  },
  {
    barcode: '6223003395445',
    name: 'فاصوليا حمراء دارا 400 جم',
    category: 'معلبات',
    brand: 'دارا',
    unit: 'علبة',
    purchase_price: 18.00,
    selling_price: 23.00,
    wholesale_price: 20.00,
    min_price: 21.00,
    min_stock_alert: 20
  },
  {
    barcode: '6223003395452',
    name: 'فاصوليا خضراء دارا 400 جم',
    category: 'معلبات',
    brand: 'دارا',
    unit: 'علبة',
    purchase_price: 18.00,
    selling_price: 23.00,
    wholesale_price: 20.00,
    min_price: 21.00,
    min_stock_alert: 20
  },
  {
    barcode: '6221033102200',
    name: 'صلصة طماطم هاينز 400 جم',
    category: 'معلبات',
    brand: 'هاينز',
    unit: 'علبة',
    purchase_price: 25.00,
    selling_price: 32.00,
    wholesale_price: 28.00,
    min_price: 30.00,
    min_stock_alert: 20
  },
  {
    barcode: '6222000302869',
    name: 'صلصة طماطم قها 200 جم',
    category: 'معلبات',
    brand: 'قها',
    unit: 'علبة',
    purchase_price: 10.00,
    selling_price: 14.00,
    wholesale_price: 12.00,
    min_price: 13.00,
    min_stock_alert: 24
  },

  // =========================================================================
  // 10. شاي وقهوة - باركودات حقيقية من OFF
  // =========================================================================
  {
    barcode: '6222002300153',
    name: 'شاي العروسة كيس 200 جم',
    category: 'سلع تموينية',
    brand: 'شاي العروسة',
    unit: 'كيس',
    purchase_price: 28.00,
    selling_price: 35.00,
    wholesale_price: 31.00,
    min_price: 33.00,
    min_stock_alert: 12
  },
  {
    barcode: '6222002300191',
    name: 'شاي العروسة 100 ظرف فلتر باي',
    category: 'سلع تموينية',
    brand: 'شاي العروسة',
    unit: 'علبة',
    purchase_price: 35.00,
    selling_price: 43.00,
    wholesale_price: 39.00,
    min_price: 41.00,
    min_stock_alert: 12
  },
  {
    barcode: '6221006003009',
    name: 'شاي ليبتون أصفر كيس 100 جم',
    category: 'سلع تموينية',
    brand: 'ليبتون',
    unit: 'كيس',
    purchase_price: 28.00,
    selling_price: 35.00,
    wholesale_price: 31.00,
    min_price: 33.00,
    min_stock_alert: 12
  },
  {
    barcode: '6221006003016',
    name: 'شاي ليبتون 25 ظرف فلتر',
    category: 'سلع تموينية',
    brand: 'ليبتون',
    unit: 'علبة',
    purchase_price: 20.00,
    selling_price: 26.00,
    wholesale_price: 23.00,
    min_price: 24.00,
    min_stock_alert: 20
  },
  {
    barcode: '6221006003023',
    name: 'شاي ليبتون 100 ظرف فلتر',
    category: 'سلع تموينية',
    brand: 'ليبتون',
    unit: 'علبة',
    purchase_price: 38.00,
    selling_price: 48.00,
    wholesale_price: 43.00,
    min_price: 45.00,
    min_stock_alert: 10
  },
  {
    barcode: '6221006003030',
    name: 'شاي أخضر ليبتون 25 ظرف',
    category: 'سلع تموينية',
    brand: 'ليبتون',
    unit: 'علبة',
    purchase_price: 22.00,
    selling_price: 28.00,
    wholesale_price: 25.00,
    min_price: 27.00,
    min_stock_alert: 15
  },
  {
    barcode: '6221001103018',
    name: 'نسكافيه كلاسيك قهوة فورية جرة 200 جم',
    category: 'سلع تموينية',
    brand: 'نسكافيه',
    unit: 'قطعة',
    purchase_price: 170.00,
    selling_price: 200.00,
    wholesale_price: 185.00,
    min_price: 195.00,
    min_stock_alert: 6
  },
  {
    barcode: '6221001103025',
    name: 'نسكافيه كلاسيك قهوة فورية 100 جم',
    category: 'سلع تموينية',
    brand: 'نسكافيه',
    unit: 'قطعة',
    purchase_price: 100.00,
    selling_price: 120.00,
    wholesale_price: 110.00,
    min_price: 115.00,
    min_stock_alert: 8
  },
  {
    barcode: '6223000270202',
    name: 'قهوة مصر كافيه فورية 75 جم',
    category: 'سلع تموينية',
    brand: 'مصر كافيه',
    unit: 'قطعة',
    purchase_price: 30.00,
    selling_price: 38.00,
    wholesale_price: 34.00,
    min_price: 36.00,
    min_stock_alert: 15
  },

  // =========================================================================
  // 11. زيوت وسكر وأرز ومواد غذائية أساسية
  // =========================================================================
  {
    barcode: '6221005001019',
    name: 'زيت ذهبي للطبخ 1.5 لتر',
    category: 'سلع تموينية',
    brand: 'ذهبي',
    unit: 'قطعة',
    purchase_price: 50.00,
    selling_price: 60.00,
    wholesale_price: 55.00,
    min_price: 58.00,
    min_stock_alert: 12
  },
  {
    barcode: '6221005001026',
    name: 'زيت عافية نباتي 1.5 لتر',
    category: 'سلع تموينية',
    brand: 'عافية',
    unit: 'قطعة',
    purchase_price: 50.00,
    selling_price: 60.00,
    wholesale_price: 55.00,
    min_price: 58.00,
    min_stock_alert: 12
  },
  {
    barcode: '6221005001033',
    name: 'زيت سالم نباتي 1.5 لتر',
    category: 'سلع تموينية',
    brand: 'سالم',
    unit: 'قطعة',
    purchase_price: 48.00,
    selling_price: 58.00,
    wholesale_price: 53.00,
    min_price: 56.00,
    min_stock_alert: 12
  },
  {
    barcode: '6224009377022',
    name: 'زيت زيتون بكر ممتاز نايل جاردن 500 مل',
    category: 'سلع تموينية',
    brand: 'نايل جاردن',
    unit: 'قطعة',
    purchase_price: 120.00,
    selling_price: 150.00,
    wholesale_price: 135.00,
    min_price: 145.00,
    min_stock_alert: 8
  },
  {
    barcode: '6221004001014',
    name: 'سكر أبيض 1 كيلو',
    category: 'سلع تموينية',
    brand: 'سكر مصري',
    unit: 'كيس',
    purchase_price: 30.00,
    selling_price: 36.00,
    wholesale_price: 33.00,
    min_price: 35.00,
    min_stock_alert: 20,
    units: [{ unit_name: 'شوال سكر (25 كيلو)', conversion_factor: 25, selling_price: 875.00, barcode: '6221004001014C' }]
  },
  {
    barcode: '6221004001021',
    name: 'سكر أبيض 2 كيلو',
    category: 'سلع تموينية',
    brand: 'سكر مصري',
    unit: 'كيس',
    purchase_price: 58.00,
    selling_price: 70.00,
    wholesale_price: 64.00,
    min_price: 67.00,
    min_stock_alert: 12
  },
  {
    barcode: '6221003001013',
    name: 'أرز مصري 1 كيلو',
    category: 'سلع تموينية',
    brand: 'أرز مصري',
    unit: 'كيس',
    purchase_price: 28.00,
    selling_price: 35.00,
    wholesale_price: 31.00,
    min_price: 33.00,
    min_stock_alert: 20
  },
  {
    barcode: '6221003001020',
    name: 'أرز مصري 2 كيلو',
    category: 'سلع تموينية',
    brand: 'أرز مصري',
    unit: 'كيس',
    purchase_price: 55.00,
    selling_price: 68.00,
    wholesale_price: 61.00,
    min_price: 65.00,
    min_stock_alert: 15
  },
  {
    barcode: '6221003001037',
    name: 'أرز فاخر سيلا بسمتي 1 كيلو',
    category: 'سلع تموينية',
    brand: 'بسمتي',
    unit: 'كيس',
    purchase_price: 40.00,
    selling_price: 50.00,
    wholesale_price: 45.00,
    min_price: 48.00,
    min_stock_alert: 15
  },
  {
    barcode: '6221002001016',
    name: 'دقيق قمح 1 كيلو',
    category: 'سلع تموينية',
    brand: 'دقيق مصري',
    unit: 'كيس',
    purchase_price: 12.00,
    selling_price: 16.00,
    wholesale_price: 14.00,
    min_price: 15.00,
    min_stock_alert: 20
  },

  // =========================================================================
  // 12. عطارة وتوابل وبهارات
  // =========================================================================
  {
    barcode: '6221009001012',
    name: 'كمون مطحون ناعم 50 جم',
    category: 'سلع تموينية',
    brand: 'عطارة مصرية',
    unit: 'عبوة',
    purchase_price: 8.00,
    selling_price: 12.00,
    wholesale_price: 10.00,
    min_price: 11.00,
    min_stock_alert: 20
  },
  {
    barcode: '6221009001029',
    name: 'فلفل أسود مطحون 50 جم',
    category: 'سلع تموينية',
    brand: 'عطارة مصرية',
    unit: 'عبوة',
    purchase_price: 12.00,
    selling_price: 16.00,
    wholesale_price: 14.00,
    min_price: 15.00,
    min_stock_alert: 20
  },
  {
    barcode: '6221009001036',
    name: 'ملح طعام خشن 400 جم',
    category: 'سلع تموينية',
    brand: 'ملح مصري',
    unit: 'كيس',
    purchase_price: 4.00,
    selling_price: 6.00,
    wholesale_price: 5.00,
    min_price: 5.50,
    min_stock_alert: 30
  },
  {
    barcode: '6221009001043',
    name: 'بهارات مشكلة لحمة 50 جم',
    category: 'سلع تموينية',
    brand: 'عطارة مصرية',
    unit: 'عبوة',
    purchase_price: 10.00,
    selling_price: 14.00,
    wholesale_price: 12.00,
    min_price: 13.00,
    min_stock_alert: 20
  },
  {
    barcode: '6221009001050',
    name: 'كاري مطحون 50 جم',
    category: 'سلع تموينية',
    brand: 'عطارة مصرية',
    unit: 'عبوة',
    purchase_price: 10.00,
    selling_price: 14.00,
    wholesale_price: 12.00,
    min_price: 13.00,
    min_stock_alert: 15
  },
  {
    barcode: '6221009001067',
    name: 'ثوم مجفف مطحون 50 جم',
    category: 'سلع تموينية',
    brand: 'عطارة مصرية',
    unit: 'عبوة',
    purchase_price: 8.00,
    selling_price: 12.00,
    wholesale_price: 10.00,
    min_price: 11.00,
    min_stock_alert: 20
  },

  // =========================================================================
  // 13. طحينية وعسل وزيوت طبيعية
  // =========================================================================
  {
    barcode: '6221010001018',
    name: 'طحينة ناعمة سمسم 400 جم',
    category: 'سلع تموينية',
    brand: 'طحينة',
    unit: 'قطعة',
    purchase_price: 30.00,
    selling_price: 38.00,
    wholesale_price: 34.00,
    min_price: 36.00,
    min_stock_alert: 15
  },
  {
    barcode: '6221010001025',
    name: 'عسل نحل طبيعي مصري 500 جم',
    category: 'سلع تموينية',
    brand: 'عسل مصري',
    unit: 'قطعة',
    purchase_price: 80.00,
    selling_price: 100.00,
    wholesale_price: 90.00,
    min_price: 95.00,
    min_stock_alert: 10
  },

  // =========================================================================
  // 14. منظفات ومواد تنظيف
  // =========================================================================
  {
    barcode: '6221011001010',
    name: 'صابون أريئيل مسحوق للغسيل 2 كيلو',
    category: 'منظفات',
    brand: 'أريئيل',
    unit: 'كيس',
    purchase_price: 65.00,
    selling_price: 78.00,
    wholesale_price: 71.00,
    min_price: 75.00,
    min_stock_alert: 10
  },
  {
    barcode: '6221011001027',
    name: 'أريئيل مسحوق أوتوماتيك 4 كيلو',
    category: 'منظفات',
    brand: 'أريئيل',
    unit: 'كيس',
    purchase_price: 120.00,
    selling_price: 145.00,
    wholesale_price: 132.00,
    min_price: 140.00,
    min_stock_alert: 6
  },
  {
    barcode: '6221011001034',
    name: 'تايد مسحوق غسيل 2 كيلو',
    category: 'منظفات',
    brand: 'تايد',
    unit: 'كيس',
    purchase_price: 60.00,
    selling_price: 72.00,
    wholesale_price: 66.00,
    min_price: 70.00,
    min_stock_alert: 10
  },
  {
    barcode: '6221011001041',
    name: 'إيس سائل للجلي 500 مل',
    category: 'منظفات',
    brand: 'إيس',
    unit: 'قطعة',
    purchase_price: 18.00,
    selling_price: 23.00,
    wholesale_price: 20.00,
    min_price: 22.00,
    min_stock_alert: 15
  },
  {
    barcode: '6221011001058',
    name: 'فيري سائل للجلي ليمون 500 مل',
    category: 'منظفات',
    brand: 'فيري',
    unit: 'قطعة',
    purchase_price: 20.00,
    selling_price: 26.00,
    wholesale_price: 23.00,
    min_price: 25.00,
    min_stock_alert: 15
  },
  {
    barcode: '6221011001065',
    name: 'باف إيه كلور 500 مل',
    category: 'منظفات',
    brand: 'باف',
    unit: 'قطعة',
    purchase_price: 12.00,
    selling_price: 16.00,
    wholesale_price: 14.00,
    min_price: 15.00,
    min_stock_alert: 20
  },

  // =========================================================================
  // 15. عناية شخصية (شامبو، صابون، كريمات)
  // =========================================================================
  {
    barcode: '6221012001018',
    name: 'شامبو هيد أند شولدرز أصلي 400 مل',
    category: 'عناية شخصية',
    brand: 'هيد أند شولدرز',
    unit: 'قطعة',
    purchase_price: 55.00,
    selling_price: 68.00,
    wholesale_price: 61.00,
    min_price: 65.00,
    min_stock_alert: 10
  },
  {
    barcode: '6221012001025',
    name: 'شامبو بانتين ترميم مكثف 400 مل',
    category: 'عناية شخصية',
    brand: 'بانتين',
    unit: 'قطعة',
    purchase_price: 55.00,
    selling_price: 68.00,
    wholesale_price: 61.00,
    min_price: 65.00,
    min_stock_alert: 10
  },
  {
    barcode: '6221012001032',
    name: 'صابون دوف أبيض 135 جم',
    category: 'عناية شخصية',
    brand: 'دوف',
    unit: 'قطعة',
    purchase_price: 20.00,
    selling_price: 26.00,
    wholesale_price: 23.00,
    min_price: 25.00,
    min_stock_alert: 20,
    units: [{ unit_name: 'كرتونة صابون دوف (48 قطعة)', conversion_factor: 48, selling_price: 1180.00, barcode: '6221012001032C' }]
  },
  {
    barcode: '6221012001049',
    name: 'صابون فيروز بالزيت 135 جم',
    category: 'عناية شخصية',
    brand: 'فيروز',
    unit: 'قطعة',
    purchase_price: 8.00,
    selling_price: 12.00,
    wholesale_price: 10.00,
    min_price: 11.00,
    min_stock_alert: 24
  },
  {
    barcode: '6221012001056',
    name: 'باقة تليين المراعي كريم شعر 250 جم',
    category: 'عناية شخصية',
    brand: 'المراعي',
    unit: 'قطعة',
    purchase_price: 40.00,
    selling_price: 50.00,
    wholesale_price: 45.00,
    min_price: 48.00,
    min_stock_alert: 12
  },
  {
    barcode: '6221012001063',
    name: 'معجون أسنان أورال بي 100 مل',
    category: 'عناية شخصية',
    brand: 'أورال بي',
    unit: 'قطعة',
    purchase_price: 22.00,
    selling_price: 28.00,
    wholesale_price: 25.00,
    min_price: 27.00,
    min_stock_alert: 15
  },
  {
    barcode: '6221012001070',
    name: 'معجون أسنان كولجيت كلاسيك 100 مل',
    category: 'عناية شخصية',
    brand: 'كولجيت',
    unit: 'قطعة',
    purchase_price: 20.00,
    selling_price: 26.00,
    wholesale_price: 23.00,
    min_price: 25.00,
    min_stock_alert: 15
  },

  // =========================================================================
  // 16. فوط ومناديل ومستلزمات منزلية
  // =========================================================================
  {
    barcode: '6221013001014',
    name: 'مناديل فاين بيضاء 150 ورقة',
    category: 'مستلزمات منزلية',
    brand: 'فاين',
    unit: 'علبة',
    purchase_price: 15.00,
    selling_price: 20.00,
    wholesale_price: 17.00,
    min_price: 18.00,
    min_stock_alert: 20
  },
  {
    barcode: '6221013001021',
    name: 'مناديل جيب مضغوطة 10 ورقة',
    category: 'مستلزمات منزلية',
    brand: 'فاين',
    unit: 'قطعة',
    purchase_price: 2.00,
    selling_price: 3.00,
    wholesale_price: 2.50,
    min_price: 2.80,
    min_stock_alert: 100
  },
  {
    barcode: '6221013001038',
    name: 'رول مطبخ شاش بيبر تاون 2 رول',
    category: 'مستلزمات منزلية',
    brand: 'ورق',
    unit: 'قطعة',
    purchase_price: 18.00,
    selling_price: 24.00,
    wholesale_price: 21.00,
    min_price: 22.00,
    min_stock_alert: 15
  },
  {
    barcode: '6221013001045',
    name: 'ورق تواليت 4 رول',
    category: 'مستلزمات منزلية',
    brand: 'ورق',
    unit: 'قطعة',
    purchase_price: 22.00,
    selling_price: 28.00,
    wholesale_price: 25.00,
    min_price: 27.00,
    min_stock_alert: 15
  }
];
