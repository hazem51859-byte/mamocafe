/**
 * كتالوج اللبان والحلويات والبسكويت والشوكولاتة والكيك بجميع الشركات والأطعم
 * الباركودات الحقيقية الموثقة من Open Food Facts و GS1 Egypt
 */
module.exports = [
  // =========================================================================
  // 1. لبان ترايدنت (Trident) - Mondelez - باركودات حقيقية
  // =========================================================================
  {
    barcode: '7622201702793',
    name: 'لبان ترايدنت شريط توت مشكل ميكس بيريز 14 حبة',
    category: 'لبان وحلويات وبسكويت',
    brand: 'ترايدنت',
    unit: 'شريط',
    purchase_price: 12.00,
    selling_price: 15.00,
    wholesale_price: 13.50,
    min_price: 14.00,
    min_stock_alert: 30,
    units: [{ unit_name: 'علبة ترايدنت (12 شريط)', conversion_factor: 12, selling_price: 170.00, barcode: '7622201702793C' }]
  },
  {
    barcode: '7622300481116',
    name: 'لبان ترايدنت شريط نعناع أخضر سبيرمنت 14 حبة',
    category: 'لبان وحلويات وبسكويت',
    brand: 'ترايدنت',
    unit: 'شريط',
    purchase_price: 12.00,
    selling_price: 15.00,
    wholesale_price: 13.50,
    min_price: 14.00,
    min_stock_alert: 30
  },
  {
    barcode: '7622300481154',
    name: 'لبان ترايدنت شريط نعناع حار بيبرمنت 14 حبة',
    category: 'لبان وحلويات وبسكويت',
    brand: 'ترايدنت',
    unit: 'شريط',
    purchase_price: 12.00,
    selling_price: 15.00,
    wholesale_price: 13.50,
    min_price: 14.00,
    min_stock_alert: 30
  },
  {
    barcode: '7622300481123',
    name: 'لبان ترايدنت شريط بطيخ منعش 14 حبة',
    category: 'لبان وحلويات وبسكويت',
    brand: 'ترايدنت',
    unit: 'شريط',
    purchase_price: 12.00,
    selling_price: 15.00,
    wholesale_price: 13.50,
    min_price: 14.00,
    min_stock_alert: 25
  },
  {
    barcode: '7622300481130',
    name: 'لبان ترايدنت شريط فراولة منعشة 14 حبة',
    category: 'لبان وحلويات وبسكويت',
    brand: 'ترايدنت',
    unit: 'شريط',
    purchase_price: 12.00,
    selling_price: 15.00,
    wholesale_price: 13.50,
    min_price: 14.00,
    min_stock_alert: 25
  },
  {
    barcode: '7622300481147',
    name: 'لبان ترايدنت شريط برتقال وفواكه استوائية 14 حبة',
    category: 'لبان وحلويات وبسكويت',
    brand: 'ترايدنت',
    unit: 'شريط',
    purchase_price: 12.00,
    selling_price: 15.00,
    wholesale_price: 13.50,
    min_price: 14.00,
    min_stock_alert: 25
  },

  // =========================================================================
  // 2. لبان كلورتس (Clorets) - Mondelez
  // =========================================================================
  {
    barcode: '7622210940735',
    name: 'لبان كلورتس شريط نعناع أخضر كلاسيك بالكلوروفيل',
    category: 'لبان وحلويات وبسكويت',
    brand: 'كلورتس',
    unit: 'شريط',
    purchase_price: 10.00,
    selling_price: 13.00,
    wholesale_price: 11.50,
    min_price: 12.00,
    min_stock_alert: 30,
    units: [{ unit_name: 'علبة كلورتس (12 شريط)', conversion_factor: 12, selling_price: 145.00, barcode: '7622210940735C' }]
  },
  {
    barcode: '7622210940711',
    name: 'لبان كلورتس أصلي حبتين نعناع أخضر (باكت صغير)',
    category: 'لبان وحلويات وبسكويت',
    brand: 'كلورتس',
    unit: 'قطعة',
    purchase_price: 1.50,
    selling_price: 2.00,
    wholesale_price: 1.70,
    min_price: 1.90,
    min_stock_alert: 100,
    units: [{ unit_name: 'علبة كلورتس حبتين (100 باكت)', conversion_factor: 100, selling_price: 180.00, barcode: '7622210940711C' }]
  },
  {
    barcode: '7622210940728',
    name: 'لبان كلورتس شريط نعناع حار بيبرمنت أبيض',
    category: 'لبان وحلويات وبسكويت',
    brand: 'كلورتس',
    unit: 'شريط',
    purchase_price: 10.00,
    selling_price: 13.00,
    wholesale_price: 11.50,
    min_price: 12.00,
    min_stock_alert: 25
  },
  {
    barcode: '7622210940742',
    name: 'لبان كلورتس إكسترا سترونج أسود نعناع قوي',
    category: 'لبان وحلويات وبسكويت',
    brand: 'كلورتس',
    unit: 'شريط',
    purchase_price: 10.00,
    selling_price: 13.00,
    wholesale_price: 11.50,
    min_price: 12.00,
    min_stock_alert: 25
  },

  // =========================================================================
  // 3. لبان تشكلتس وشيكلتس (Chiclets)
  // =========================================================================
  {
    barcode: '7622200396847',
    name: 'لبان تشكلتس حبتين أصفر نعناع كلاسيك',
    category: 'لبان وحلويات وبسكويت',
    brand: 'تشكلتس',
    unit: 'قطعة',
    purchase_price: 1.50,
    selling_price: 2.00,
    wholesale_price: 1.70,
    min_price: 1.90,
    min_stock_alert: 100,
    units: [{ unit_name: 'علبة تشكلتس حبتين (100 باكت)', conversion_factor: 100, selling_price: 180.00, barcode: '7622200396847C' }]
  },
  {
    barcode: '7622200396854',
    name: 'لبان تشكلتس حبتين وردي توتي فروتي فواكه',
    category: 'لبان وحلويات وبسكويت',
    brand: 'تشكلتس',
    unit: 'قطعة',
    purchase_price: 1.50,
    selling_price: 2.00,
    wholesale_price: 1.70,
    min_price: 1.90,
    min_stock_alert: 100
  },
  {
    barcode: '7622200396861',
    name: 'لبان تشكلتس علبة شريط فواكه مشكلة ملونة',
    category: 'لبان وحلويات وبسكويت',
    brand: 'تشكلتس',
    unit: 'شريط',
    purchase_price: 8.00,
    selling_price: 10.00,
    wholesale_price: 9.00,
    min_price: 9.50,
    min_stock_alert: 30
  },

  // =========================================================================
  // 4. حلوى منتوس (Mentos)
  // =========================================================================
  {
    barcode: '8710447024386',
    name: 'منتوس لفافة نعناع أبيض الأصلي 38 جم',
    category: 'لبان وحلويات وبسكويت',
    brand: 'منتوس',
    unit: 'لفافة',
    purchase_price: 8.00,
    selling_price: 10.00,
    wholesale_price: 9.00,
    min_price: 9.50,
    min_stock_alert: 30,
    units: [{ unit_name: 'علبة منتوس (15 لفافة)', conversion_factor: 15, selling_price: 140.00, barcode: '8710447024386C' }]
  },
  {
    barcode: '8710447024393',
    name: 'منتوس لفافة توت فراولة مشكل فواكه 38 جم',
    category: 'لبان وحلويات وبسكويت',
    brand: 'منتوس',
    unit: 'لفافة',
    purchase_price: 8.00,
    selling_price: 10.00,
    wholesale_price: 9.00,
    min_price: 9.50,
    min_stock_alert: 30
  },
  {
    barcode: '8710447024409',
    name: 'منتوس لفافة تفاحة خضراء منعشة 38 جم',
    category: 'لبان وحلويات وبسكويت',
    brand: 'منتوس',
    unit: 'لفافة',
    purchase_price: 8.00,
    selling_price: 10.00,
    wholesale_price: 9.00,
    min_price: 9.50,
    min_stock_alert: 25
  },
  {
    barcode: '8710447024416',
    name: 'منتوس لفافة ليمون منعش 38 جم',
    category: 'لبان وحلويات وبسكويت',
    brand: 'منتوس',
    unit: 'لفافة',
    purchase_price: 8.00,
    selling_price: 10.00,
    wholesale_price: 9.00,
    min_price: 9.50,
    min_stock_alert: 25
  },

  // =========================================================================
  // 5. حلوى هولز (Halls) - Mondelez
  // =========================================================================
  {
    barcode: '7622201694869',
    name: 'هولز كيرزي علبة نعناع حار 33.5 جم',
    category: 'لبان وحلويات وبسكويت',
    brand: 'هولز',
    unit: 'علبة',
    purchase_price: 8.00,
    selling_price: 10.00,
    wholesale_price: 9.00,
    min_price: 9.50,
    min_stock_alert: 30,
    units: [{ unit_name: 'علبة هولز (20 علبة)', conversion_factor: 20, selling_price: 180.00, barcode: '7622201694869C' }]
  },
  {
    barcode: '7622201694852',
    name: 'هولز نعناع أبيض قوي سترونج 33.5 جم',
    category: 'لبان وحلويات وبسكويت',
    brand: 'هولز',
    unit: 'علبة',
    purchase_price: 8.00,
    selling_price: 10.00,
    wholesale_price: 9.00,
    min_price: 9.50,
    min_stock_alert: 25
  },
  {
    barcode: '7622201694876',
    name: 'هولز بلاك كرانت توت أزرق 33.5 جم',
    category: 'لبان وحلويات وبسكويت',
    brand: 'هولز',
    unit: 'علبة',
    purchase_price: 8.00,
    selling_price: 10.00,
    wholesale_price: 9.00,
    min_price: 9.50,
    min_stock_alert: 25
  },
  {
    barcode: '7622201694838',
    name: 'هولز ليمون منعش 33.5 جم',
    category: 'لبان وحلويات وبسكويت',
    brand: 'هولز',
    unit: 'علبة',
    purchase_price: 8.00,
    selling_price: 10.00,
    wholesale_price: 9.00,
    min_price: 9.50,
    min_stock_alert: 25
  },

  // =========================================================================
  // 6. أوريو (Oreo) - Mondelez - باركودات حقيقية من OFF
  // =========================================================================
  {
    barcode: '7622210354785',
    name: 'أوريو بسكويت شوكولاتة وكريمة بيضاء أصلي 133 جم',
    category: 'لبان وحلويات وبسكويت',
    brand: 'أوريو',
    unit: 'قطعة',
    purchase_price: 20.00,
    selling_price: 25.00,
    wholesale_price: 22.00,
    min_price: 23.00,
    min_stock_alert: 24,
    units: [{ unit_name: 'كرتونة أوريو (12 علبة)', conversion_factor: 12, selling_price: 285.00, barcode: '7622210354785C' }]
  },
  {
    barcode: '7622210627216',
    name: 'أوريو أصلي علبة فردية 36.8 جم صغير',
    category: 'لبان وحلويات وبسكويت',
    brand: 'أوريو',
    unit: 'قطعة',
    purchase_price: 6.00,
    selling_price: 8.00,
    wholesale_price: 7.00,
    min_price: 7.50,
    min_stock_alert: 48
  },
  {
    barcode: '7622201764555',
    name: 'أوريو بسكويت شوكولاتة وكريمة أصلي 36.8 جم',
    category: 'لبان وحلويات وبسكويت',
    brand: 'أوريو',
    unit: 'قطعة',
    purchase_price: 6.00,
    selling_price: 8.00,
    wholesale_price: 7.00,
    min_price: 7.50,
    min_stock_alert: 48
  },
  {
    barcode: '7622201699277',
    name: 'كادبوري شوكو كوتد أوريو كادبوري داخل الشوكولاتة',
    category: 'لبان وحلويات وبسكويت',
    brand: 'كادبوري',
    unit: 'قطعة',
    purchase_price: 18.00,
    selling_price: 22.00,
    wholesale_price: 20.00,
    min_price: 21.00,
    min_stock_alert: 20
  },

  // =========================================================================
  // 7. بوريو (Borio) - باركود حقيقي من OFF
  // =========================================================================
  {
    barcode: '7622210606044',
    name: 'بوريو بسكويت شوكولاتة جامبو كبير',
    category: 'لبان وحلويات وبسكويت',
    brand: 'بوريو',
    unit: 'قطعة',
    purchase_price: 12.00,
    selling_price: 15.00,
    wholesale_price: 13.50,
    min_price: 14.00,
    min_stock_alert: 30,
    units: [{ unit_name: 'كرتونة بوريو (12 علبة)', conversion_factor: 12, selling_price: 170.00, barcode: '7622210606044C' }]
  },
  {
    barcode: '7622210606013',
    name: 'بوريو بسكويت شوكولاتة أصلي عادي',
    category: 'لبان وحلويات وبسكويت',
    brand: 'بوريو',
    unit: 'قطعة',
    purchase_price: 8.00,
    selling_price: 10.00,
    wholesale_price: 9.00,
    min_price: 9.50,
    min_stock_alert: 48
  },
  {
    barcode: '7622210606020',
    name: 'بوريو بسكويت فانيلا وكريمة بيضاء',
    category: 'لبان وحلويات وبسكويت',
    brand: 'بوريو',
    unit: 'قطعة',
    purchase_price: 8.00,
    selling_price: 10.00,
    wholesale_price: 9.00,
    min_price: 9.50,
    min_stock_alert: 48
  },

  // =========================================================================
  // 8. كيت كات (KitKat) - Nestlé - باركودات حقيقية من OFF
  // =========================================================================
  {
    barcode: '6294003539153',
    name: 'كيت كات شوكولاتة 4 أصابع 42 جم',
    category: 'لبان وحلويات وبسكويت',
    brand: 'كيت كات',
    unit: 'قطعة',
    purchase_price: 15.00,
    selling_price: 20.00,
    wholesale_price: 17.00,
    min_price: 18.00,
    min_stock_alert: 30,
    units: [{ unit_name: 'كرتونة كيت كات (24 قطعة)', conversion_factor: 24, selling_price: 450.00, barcode: '6294003539153C' }]
  },
  {
    barcode: '6223003992002',
    name: 'كيت كات مصر 4 أصابع شوكولاتة حليب',
    category: 'لبان وحلويات وبسكويت',
    brand: 'كيت كات',
    unit: 'قطعة',
    purchase_price: 15.00,
    selling_price: 20.00,
    wholesale_price: 17.00,
    min_price: 18.00,
    min_stock_alert: 30
  },
  {
    barcode: '6223003992019',
    name: 'كيت كات أصابع صغيرة ميني 2 أصابع 20 جم',
    category: 'لبان وحلويات وبسكويت',
    brand: 'كيت كات',
    unit: 'قطعة',
    purchase_price: 7.00,
    selling_price: 9.00,
    wholesale_price: 8.00,
    min_price: 8.50,
    min_stock_alert: 48
  },
  {
    barcode: '6223003992026',
    name: 'كيت كات بوكس علبة متعددة شوكولاتة',
    category: 'لبان وحلويات وبسكويت',
    brand: 'كيت كات',
    unit: 'علبة',
    purchase_price: 45.00,
    selling_price: 55.00,
    wholesale_price: 50.00,
    min_price: 52.00,
    min_stock_alert: 12
  },

  // =========================================================================
  // 9. كادبوري (Cadbury) - Mondelez - باركودات حقيقية من OFF
  // =========================================================================
  {
    barcode: '7622210077660',
    name: 'كادبوري ديري ميلك بابلي شوكولاتة حليب فقاعات هواء 87 جم',
    category: 'لبان وحلويات وبسكويت',
    brand: 'كادبوري',
    unit: 'قطعة',
    purchase_price: 25.00,
    selling_price: 32.00,
    wholesale_price: 28.00,
    min_price: 30.00,
    min_stock_alert: 20,
    units: [{ unit_name: 'كرتونة كادبوري (16 قطعة)', conversion_factor: 16, selling_price: 490.00, barcode: '7622210077660C' }]
  },
  {
    barcode: '7622201730253',
    name: 'كادبوري ديري ميلك شوكولاتة حليب سادة 95 جم',
    category: 'لبان وحلويات وبسكويت',
    brand: 'كادبوري',
    unit: 'قطعة',
    purchase_price: 25.00,
    selling_price: 32.00,
    wholesale_price: 28.00,
    min_price: 30.00,
    min_stock_alert: 20
  },
  {
    barcode: '7622201730697',
    name: 'كادبوري فليك شوكولاتة حليب 32 جم',
    category: 'لبان وحلويات وبسكويت',
    brand: 'كادبوري',
    unit: 'قطعة',
    purchase_price: 12.00,
    selling_price: 16.00,
    wholesale_price: 13.50,
    min_price: 15.00,
    min_stock_alert: 30
  },
  {
    barcode: '7622201510633',
    name: 'كادبوري ديري ميلك بندق وشوكولاتة حليب هازلنت 95 جم',
    category: 'لبان وحلويات وبسكويت',
    brand: 'كادبوري',
    unit: 'قطعة',
    purchase_price: 28.00,
    selling_price: 36.00,
    wholesale_price: 32.00,
    min_price: 34.00,
    min_stock_alert: 15
  },
  {
    barcode: '7622210549440',
    name: 'كادبوري شوكو دلايت بسكويت شوكولاتة',
    category: 'لبان وحلويات وبسكويت',
    brand: 'كادبوري',
    unit: 'قطعة',
    purchase_price: 20.00,
    selling_price: 25.00,
    wholesale_price: 22.00,
    min_price: 23.00,
    min_stock_alert: 20
  },
  {
    barcode: '7622210292711',
    name: 'كادبوري هازلنت شوكولاتة بندق مصري',
    category: 'لبان وحلويات وبسكويت',
    brand: 'كادبوري',
    unit: 'قطعة',
    purchase_price: 22.00,
    selling_price: 28.00,
    wholesale_price: 25.00,
    min_price: 27.00,
    min_stock_alert: 20
  },

  // =========================================================================
  // 10. جالاكسي (Galaxy) - Mars - باركودات حقيقية من OFF
  // =========================================================================
  {
    barcode: '6221134010718',
    name: 'جالاكسي فلوت 2 أصابع بالفانيليا 48 جم',
    category: 'لبان وحلويات وبسكويت',
    brand: 'جالاكسي',
    unit: 'قطعة',
    purchase_price: 15.00,
    selling_price: 20.00,
    wholesale_price: 17.00,
    min_price: 18.00,
    min_stock_alert: 30,
    units: [{ unit_name: 'كرتونة جالاكسي (24 قطعة)', conversion_factor: 24, selling_price: 450.00, barcode: '6221134010718C' }]
  },
  {
    barcode: '6294001827672',
    name: 'جالاكسي ديرك شوكولاتة داكنة بكريمة',
    category: 'لبان وحلويات وبسكويت',
    brand: 'جالاكسي',
    unit: 'قطعة',
    purchase_price: 20.00,
    selling_price: 27.00,
    wholesale_price: 23.00,
    min_price: 25.00,
    min_stock_alert: 20
  },
  {
    barcode: '5000159553896',
    name: 'جالاكسي ريبل شوكولاتة حليب 33 جم',
    category: 'لبان وحلويات وبسكويت',
    brand: 'جالاكسي',
    unit: 'قطعة',
    purchase_price: 15.00,
    selling_price: 20.00,
    wholesale_price: 17.00,
    min_price: 18.00,
    min_stock_alert: 25
  },
  {
    barcode: '6221134010725',
    name: 'جالاكسي شوكولاتة حليب بار كاملة 100 جم',
    category: 'لبان وحلويات وبسكويت',
    brand: 'جالاكسي',
    unit: 'قطعة',
    purchase_price: 35.00,
    selling_price: 45.00,
    wholesale_price: 40.00,
    min_price: 42.00,
    min_stock_alert: 15
  },
  {
    barcode: '6221134010732',
    name: 'جالاكسي شوكولاتة داكنة ريال داك 100 جم',
    category: 'لبان وحلويات وبسكويت',
    brand: 'جالاكسي',
    unit: 'قطعة',
    purchase_price: 35.00,
    selling_price: 45.00,
    wholesale_price: 40.00,
    min_price: 42.00,
    min_stock_alert: 12
  },

  // =========================================================================
  // 11. ملتو (Molto) - Edita - باركودات حقيقية من OFF
  // =========================================================================
  {
    barcode: '6223000495124',
    name: 'ملتو كرواسان مينيم ماجنوم بالشوكولاتة',
    category: 'لبان وحلويات وبسكويت',
    brand: 'ملتو',
    unit: 'قطعة',
    purchase_price: 10.00,
    selling_price: 13.00,
    wholesale_price: 11.50,
    min_price: 12.00,
    min_stock_alert: 30,
    units: [{ unit_name: 'كرتونة ملتو (24 قطعة)', conversion_factor: 24, selling_price: 295.00, barcode: '6223000495124C' }]
  },
  {
    barcode: '6223000495148',
    name: 'ملتو كرواسان بالكريمة والشوكولاتة',
    category: 'لبان وحلويات وبسكويت',
    brand: 'ملتو',
    unit: 'قطعة',
    purchase_price: 10.00,
    selling_price: 13.00,
    wholesale_price: 11.50,
    min_price: 12.00,
    min_stock_alert: 30
  },
  {
    barcode: '6223000496343',
    name: 'ملتو ميني ماجنوم شوكولاتة صغير 24 جم',
    category: 'لبان وحلويات وبسكويت',
    brand: 'ملتو',
    unit: 'قطعة',
    purchase_price: 8.00,
    selling_price: 10.00,
    wholesale_price: 9.00,
    min_price: 9.50,
    min_stock_alert: 48
  },
  {
    barcode: '6223000493533',
    name: 'ملتو كرواسان عادي بالكريمة البيضاء فانيلا',
    category: 'لبان وحلويات وبسكويت',
    brand: 'ملتو',
    unit: 'قطعة',
    purchase_price: 10.00,
    selling_price: 13.00,
    wholesale_price: 11.50,
    min_price: 12.00,
    min_stock_alert: 30
  },
  {
    barcode: '6223000494264',
    name: 'ملتو ميني شوكولاتة صغيرة متعددة',
    category: 'لبان وحلويات وبسكويت',
    brand: 'ملتو',
    unit: 'قطعة',
    purchase_price: 12.00,
    selling_price: 15.00,
    wholesale_price: 13.50,
    min_price: 14.00,
    min_stock_alert: 30
  },
  {
    barcode: '6223000491294',
    name: 'ملتو اكس اكس ال شوكولاتة وبندق كبير',
    category: 'لبان وحلويات وبسكويت',
    brand: 'ملتو',
    unit: 'قطعة',
    purchase_price: 15.00,
    selling_price: 20.00,
    wholesale_price: 17.00,
    min_price: 18.00,
    min_stock_alert: 20
  },

  // =========================================================================
  // 12. هوهوز (HoHos) - Edita - باركودات حقيقية من OFF
  // =========================================================================
  {
    barcode: '6223000552643',
    name: 'هوهوز كيك مشكل ميكس كاكاو وفانيلا 40 جم',
    category: 'لبان وحلويات وبسكويت',
    brand: 'هوهوز',
    unit: 'قطعة',
    purchase_price: 8.00,
    selling_price: 10.00,
    wholesale_price: 9.00,
    min_price: 9.50,
    min_stock_alert: 48,
    units: [{ unit_name: 'كرتونة هوهوز (24 قطعة)', conversion_factor: 24, selling_price: 225.00, barcode: '6223000552643C' }]
  },
  {
    barcode: '6223000556481',
    name: 'هوهوز كيك ملفوف بكريمة كاكاو رول كيك',
    category: 'لبان وحلويات وبسكويت',
    brand: 'هوهوز',
    unit: 'قطعة',
    purchase_price: 8.00,
    selling_price: 10.00,
    wholesale_price: 9.00,
    min_price: 9.50,
    min_stock_alert: 48
  },
  {
    barcode: '6223000555118',
    name: 'هوهوز كينج سايز كيك كريمة كبير 65 جم',
    category: 'لبان وحلويات وبسكويت',
    brand: 'هوهوز',
    unit: 'قطعة',
    purchase_price: 12.00,
    selling_price: 15.00,
    wholesale_price: 13.50,
    min_price: 14.00,
    min_stock_alert: 30
  },
  {
    barcode: '6223000493106',
    name: 'هوهوز كيك صغير 2 قطعة 40 جم',
    category: 'لبان وحلويات وبسكويت',
    brand: 'هوهوز',
    unit: 'قطعة',
    purchase_price: 6.00,
    selling_price: 8.00,
    wholesale_price: 7.00,
    min_price: 7.50,
    min_stock_alert: 48
  },
  {
    barcode: '6223000496695',
    name: 'هوهوز جونيور ميني كيك صغير جداً',
    category: 'لبان وحلويات وبسكويت',
    brand: 'هوهوز',
    unit: 'قطعة',
    purchase_price: 4.00,
    selling_price: 5.00,
    wholesale_price: 4.50,
    min_price: 4.80,
    min_stock_alert: 72
  },
  {
    barcode: '6223000551530',
    name: 'هوهوز جامبو كيك كبير مستطيل',
    category: 'لبان وحلويات وبسكويت',
    brand: 'هوهوز',
    unit: 'قطعة',
    purchase_price: 15.00,
    selling_price: 20.00,
    wholesale_price: 17.00,
    min_price: 18.00,
    min_stock_alert: 24
  },
  {
    barcode: '6223000498231',
    name: 'هوهوز كيك مشكل باكت 7 جنيه',
    category: 'لبان وحلويات وبسكويت',
    brand: 'هوهوز',
    unit: 'قطعة',
    purchase_price: 6.00,
    selling_price: 7.00,
    wholesale_price: 6.50,
    min_price: 7.00,
    min_stock_alert: 48
  },

  // =========================================================================
  // 13. توينكيز (Twinkies) - Edita - باركودات حقيقية من OFF
  // =========================================================================
  {
    barcode: '6223000492130',
    name: 'توينكيز شوكولاتة كيك مليان كريمة 40 جم',
    category: 'لبان وحلويات وبسكويت',
    brand: 'توينكيز',
    unit: 'قطعة',
    purchase_price: 8.00,
    selling_price: 10.00,
    wholesale_price: 9.00,
    min_price: 9.50,
    min_stock_alert: 48,
    units: [{ unit_name: 'كرتونة توينكيز (24 قطعة)', conversion_factor: 24, selling_price: 225.00, barcode: '6223000492130C' }]
  },
  {
    barcode: '6223000495742',
    name: 'توينكيز فانيلا كيك كريمة أصلي',
    category: 'لبان وحلويات وبسكويت',
    brand: 'توينكيز',
    unit: 'قطعة',
    purchase_price: 8.00,
    selling_price: 10.00,
    wholesale_price: 9.00,
    min_price: 9.50,
    min_stock_alert: 48
  },
  {
    barcode: '6223000555231',
    name: 'توينكيز ريجولار كيك فانيلا الأصلية',
    category: 'لبان وحلويات وبسكويت',
    brand: 'توينكيز',
    unit: 'قطعة',
    purchase_price: 8.00,
    selling_price: 10.00,
    wholesale_price: 9.00,
    min_price: 9.50,
    min_stock_alert: 48
  },

  // =========================================================================
  // 14. فريسكا (Fresca) - Edita - باركودات حقيقية من OFF
  // =========================================================================
  {
    barcode: '6223000498309',
    name: 'فريسكا ويفر مغطى بالشوكولاتة 30 جم',
    category: 'لبان وحلويات وبسكويت',
    brand: 'فريسكا',
    unit: 'قطعة',
    purchase_price: 8.00,
    selling_price: 10.00,
    wholesale_price: 9.00,
    min_price: 9.50,
    min_stock_alert: 48,
    units: [{ unit_name: 'كرتونة فريسكا (24 قطعة)', conversion_factor: 24, selling_price: 225.00, barcode: '6223000498309C' }]
  },
  {
    barcode: '6223000557624',
    name: 'فريسكا ويفر أصابع فيجان بدون ألبان',
    category: 'لبان وحلويات وبسكويت',
    brand: 'فريسكا',
    unit: 'قطعة',
    purchase_price: 10.00,
    selling_price: 13.00,
    wholesale_price: 11.50,
    min_price: 12.00,
    min_stock_alert: 30
  },
  {
    barcode: '6223000498316',
    name: 'فريسكا ويفر بالكريمة البيضاء فانيلا',
    category: 'لبان وحلويات وبسكويت',
    brand: 'فريسكا',
    unit: 'قطعة',
    purchase_price: 8.00,
    selling_price: 10.00,
    wholesale_price: 9.00,
    min_price: 9.50,
    min_stock_alert: 48
  },

  // =========================================================================
  // 15. كوكي (Koky) - Edita - باركودات حقيقية من OFF
  // =========================================================================
  {
    barcode: '6223003540630',
    name: 'كوكي كيك صغير 25 جم',
    category: 'لبان وحلويات وبسكويت',
    brand: 'كوكي',
    unit: 'قطعة',
    purchase_price: 3.00,
    selling_price: 4.00,
    wholesale_price: 3.50,
    min_price: 3.80,
    min_stock_alert: 72,
    units: [{ unit_name: 'كرتونة كوكي (24 قطعة)', conversion_factor: 24, selling_price: 88.00, barcode: '6223003540630C' }]
  },
  {
    barcode: '6223003540647',
    name: 'كوكي كيك بالشوكولاتة 25 جم',
    category: 'لبان وحلويات وبسكويت',
    brand: 'كوكي',
    unit: 'قطعة',
    purchase_price: 3.00,
    selling_price: 4.00,
    wholesale_price: 3.50,
    min_price: 3.80,
    min_stock_alert: 72
  },

  // =========================================================================
  // 16. بسكويت تودو / إيديتا (Todo - Edita)
  // =========================================================================
  {
    barcode: '6223000492000',
    name: 'تودو بومب كيك صغير قنبلة فانيلا',
    category: 'لبان وحلويات وبسكويت',
    brand: 'تودو',
    unit: 'قطعة',
    purchase_price: 4.00,
    selling_price: 5.00,
    wholesale_price: 4.50,
    min_price: 4.80,
    min_stock_alert: 72
  },
  {
    barcode: '6223000490419',
    name: 'بيك رولز إيديتا الأصلية 37 جم',
    category: 'لبان وحلويات وبسكويت',
    brand: 'إيديتا',
    unit: 'كيس',
    purchase_price: 8.00,
    selling_price: 10.00,
    wholesale_price: 9.00,
    min_price: 9.50,
    min_stock_alert: 48
  },

  // =========================================================================
  // 17. بسكويت ماكفيتيز وهالي وألكر (McVitie's, Halley, Ulker)
  // =========================================================================
  {
    barcode: '6222024104920',
    name: 'ماكفيتيز هوب نوبس بسكويت الشوفان بالشوكولاتة',
    category: 'لبان وحلويات وبسكويت',
    brand: 'ماكفيتيز',
    unit: 'قطعة',
    purchase_price: 18.00,
    selling_price: 23.00,
    wholesale_price: 20.00,
    min_price: 21.00,
    min_stock_alert: 20,
    units: [{ unit_name: 'كرتونة ماكفيتيز (12 علبة)', conversion_factor: 12, selling_price: 265.00, barcode: '6222024104920C' }]
  },
  {
    barcode: '6223003803827',
    name: 'ماكفيتيز جولدن أوت بسكويت ذهبي بالشوفان',
    category: 'لبان وحلويات وبسكويت',
    brand: 'ماكفيتيز',
    unit: 'قطعة',
    purchase_price: 18.00,
    selling_price: 23.00,
    wholesale_price: 20.00,
    min_price: 21.00,
    min_stock_alert: 20
  },
  {
    barcode: '6223003804602',
    name: 'ماكفيتيز دايجستيف بسكويت الشوفان الأصلي',
    category: 'لبان وحلويات وبسكويت',
    brand: 'ماكفيتيز',
    unit: 'قطعة',
    purchase_price: 18.00,
    selling_price: 23.00,
    wholesale_price: 20.00,
    min_price: 21.00,
    min_stock_alert: 20
  },
  {
    barcode: '6222024104524',
    name: 'ألكر (أولكر) بسكويت بالتمر',
    category: 'لبان وحلويات وبسكويت',
    brand: 'ألكر',
    unit: 'قطعة',
    purchase_price: 15.00,
    selling_price: 20.00,
    wholesale_price: 17.00,
    min_price: 18.00,
    min_stock_alert: 20
  },
  {
    barcode: '6222024105460',
    name: 'هالي بسكويت كريمة وشوكولاتة ألكر',
    category: 'لبان وحلويات وبسكويت',
    brand: 'هالي',
    unit: 'قطعة',
    purchase_price: 12.00,
    selling_price: 15.00,
    wholesale_price: 13.50,
    min_price: 14.00,
    min_stock_alert: 30
  },
  {
    barcode: '6223003803308',
    name: 'ألكر بسكويت أصابع بالشوكولاتة فينجر',
    category: 'لبان وحلويات وبسكويت',
    brand: 'ألكر',
    unit: 'قطعة',
    purchase_price: 12.00,
    selling_price: 15.00,
    wholesale_price: 13.50,
    min_price: 14.00,
    min_stock_alert: 25
  },
  {
    barcode: '6222024100922',
    name: 'ماكفيتيز بيسكريم بسكويت بالشوكولاتة والكريمة',
    category: 'لبان وحلويات وبسكويت',
    brand: 'ماكفيتيز',
    unit: 'قطعة',
    purchase_price: 15.00,
    selling_price: 20.00,
    wholesale_price: 17.00,
    min_price: 18.00,
    min_stock_alert: 20
  },
  {
    barcode: '6223003803834',
    name: 'ماكفيتيز جولدن أوت تشوكو بالشوكولاتة',
    category: 'لبان وحلويات وبسكويت',
    brand: 'ماكفيتيز',
    unit: 'قطعة',
    purchase_price: 18.00,
    selling_price: 23.00,
    wholesale_price: 20.00,
    min_price: 21.00,
    min_stock_alert: 20
  },

  // =========================================================================
  // 18. تاك (TUC) - باركود حقيقي من OFF
  // =========================================================================
  {
    barcode: '7622300876760',
    name: 'تاك بسكويت مملح الأصلي (TUC Biscuits)',
    category: 'لبان وحلويات وبسكويت',
    brand: 'تاك',
    unit: 'قطعة',
    purchase_price: 12.00,
    selling_price: 15.00,
    wholesale_price: 13.50,
    min_price: 14.00,
    min_stock_alert: 30,
    units: [{ unit_name: 'كرتونة تاك (12 علبة)', conversion_factor: 12, selling_price: 170.00, barcode: '7622300876760C' }]
  },

  // =========================================================================
  // 19. بسكو مصر (Bisco Misr)
  // =========================================================================
  {
    barcode: '6222001180060',
    name: 'بسكو ميصر لوكس مقرمشات بالفانيلا',
    category: 'لبان وحلويات وبسكويت',
    brand: 'بسكو مصر',
    unit: 'قطعة',
    purchase_price: 6.00,
    selling_price: 8.00,
    wholesale_price: 7.00,
    min_price: 7.50,
    min_stock_alert: 48,
    units: [{ unit_name: 'كرتونة بسكو مصر (24 علبة)', conversion_factor: 24, selling_price: 180.00, barcode: '6222001180060C' }]
  },
  {
    barcode: '6222001100570',
    name: 'بسكو ميصر ويفر فانيلا بسكويت',
    category: 'لبان وحلويات وبسكويت',
    brand: 'بسكو مصر',
    unit: 'قطعة',
    purchase_price: 6.00,
    selling_price: 8.00,
    wholesale_price: 7.00,
    min_price: 7.50,
    min_stock_alert: 48
  },
  {
    barcode: '6222001180565',
    name: 'بسكو مصر لوكس بسكويت كلاسيك',
    category: 'لبان وحلويات وبسكويت',
    brand: 'بسكو مصر',
    unit: 'قطعة',
    purchase_price: 8.00,
    selling_price: 10.00,
    wholesale_price: 9.00,
    min_price: 9.50,
    min_stock_alert: 48
  },
  {
    barcode: '6222009500228',
    name: 'لامبادا بسكويت كريمة',
    category: 'لبان وحلويات وبسكويت',
    brand: 'بسكو مصر',
    unit: 'قطعة',
    purchase_price: 6.00,
    selling_price: 8.00,
    wholesale_price: 7.00,
    min_price: 7.50,
    min_stock_alert: 48
  },

  // =========================================================================
  // 20. كورونا شوكولاتة (Corona Egypt) - باركودات حقيقية من OFF
  // =========================================================================
  {
    barcode: '6221073002669',
    name: 'كورونا شوكولاتة داكنة 72% كاكاو 65 جم',
    category: 'لبان وحلويات وبسكويت',
    brand: 'كورونا',
    unit: 'قطعة',
    purchase_price: 20.00,
    selling_price: 26.00,
    wholesale_price: 22.00,
    min_price: 24.00,
    min_stock_alert: 20
  },
  {
    barcode: '6221073002638',
    name: 'كورونا شوكولاتة داكنة باللوز 65 جم',
    category: 'لبان وحلويات وبسكويت',
    brand: 'كورونا',
    unit: 'قطعة',
    purchase_price: 22.00,
    selling_price: 28.00,
    wholesale_price: 24.00,
    min_price: 26.00,
    min_stock_alert: 20
  },
  {
    barcode: '6221073011180',
    name: 'كورونا شوكولاتة حليب بستيفيا بدون سكر 50 جم',
    category: 'لبان وحلويات وبسكويت',
    brand: 'كورونا',
    unit: 'قطعة',
    purchase_price: 22.00,
    selling_price: 28.00,
    wholesale_price: 24.00,
    min_price: 26.00,
    min_stock_alert: 15
  },
  {
    barcode: '6221073011739',
    name: 'كورونا لايت شوكولاتة كينج سايز كبير',
    category: 'لبان وحلويات وبسكويت',
    brand: 'كورونا',
    unit: 'قطعة',
    purchase_price: 25.00,
    selling_price: 33.00,
    wholesale_price: 28.00,
    min_price: 30.00,
    min_stock_alert: 15
  },
  {
    barcode: '6221073011760',
    name: 'كورونا داك شوكولاتة كاكاو نيوترل',
    category: 'لبان وحلويات وبسكويت',
    brand: 'كورونا',
    unit: 'قطعة',
    purchase_price: 20.00,
    selling_price: 26.00,
    wholesale_price: 22.00,
    min_price: 24.00,
    min_stock_alert: 20
  },

  // =========================================================================
  // 21. بسكويت بيمبو (Bimbo) - شوفان وبسكويت
  // =========================================================================
  {
    barcode: '6221073008043',
    name: 'بيمبو بسكويت الشوفان الطبيعي 150 جم',
    category: 'لبان وحلويات وبسكويت',
    brand: 'بيمبو',
    unit: 'قطعة',
    purchase_price: 15.00,
    selling_price: 20.00,
    wholesale_price: 17.00,
    min_price: 18.00,
    min_stock_alert: 20
  },
  {
    barcode: '6221073008012',
    name: 'بيمبو بسكويت الشوفان الصغير 100 جم',
    category: 'لبان وحلويات وبسكويت',
    brand: 'بيمبو',
    unit: 'قطعة',
    purchase_price: 12.00,
    selling_price: 16.00,
    wholesale_price: 14.00,
    min_price: 15.00,
    min_stock_alert: 24
  },

  // =========================================================================
  // 22. ميلكي واي وسنيكرز ومارس وتوبليرون
  // =========================================================================
  {
    barcode: '5000159550802',
    name: 'ميلكي واي شوكولاتة 58 جم',
    category: 'لبان وحلويات وبسكويت',
    brand: 'ميلكي واي',
    unit: 'قطعة',
    purchase_price: 20.00,
    selling_price: 26.00,
    wholesale_price: 22.00,
    min_price: 24.00,
    min_stock_alert: 20
  },
  {
    barcode: '5000159461122',
    name: 'سنيكرز شوكولاتة وكراميل وفول سوداني 50 جم',
    category: 'لبان وحلويات وبسكويت',
    brand: 'سنيكرز',
    unit: 'قطعة',
    purchase_price: 20.00,
    selling_price: 26.00,
    wholesale_price: 22.00,
    min_price: 24.00,
    min_stock_alert: 20
  },
  {
    barcode: '5000159014908',
    name: 'مارس شوكولاتة وكراميل 51 جم',
    category: 'لبان وحلويات وبسكويت',
    brand: 'مارس',
    unit: 'قطعة',
    purchase_price: 20.00,
    selling_price: 26.00,
    wholesale_price: 22.00,
    min_price: 24.00,
    min_stock_alert: 20
  },
  {
    barcode: '7614500010063',
    name: 'توبليرون شوكولاتة سويسرية مثلثات 100 جم',
    category: 'لبان وحلويات وبسكويت',
    brand: 'توبليرون',
    unit: 'قطعة',
    purchase_price: 45.00,
    selling_price: 60.00,
    wholesale_price: 52.00,
    min_price: 55.00,
    min_stock_alert: 12
  },
  {
    barcode: '5000159530569',
    name: 'باونتي شوكولاتة وجوز هند 57 جم',
    category: 'لبان وحلويات وبسكويت',
    brand: 'باونتي',
    unit: 'قطعة',
    purchase_price: 20.00,
    selling_price: 26.00,
    wholesale_price: 22.00,
    min_price: 24.00,
    min_stock_alert: 20
  },

  // =========================================================================
  // 23. حلاوة مصرية (El Rashidi El Mizan) - باركودات حقيقية من OFF
  // =========================================================================
  {
    barcode: '6223000760215',
    name: 'حلاوة الرشيدي المزان سادة 400 جم',
    category: 'لبان وحلويات وبسكويت',
    brand: 'الرشيدي المزان',
    unit: 'قطعة',
    purchase_price: 20.00,
    selling_price: 25.00,
    wholesale_price: 22.00,
    min_price: 23.00,
    min_stock_alert: 20,
    units: [{ unit_name: 'كرتونة حلاوة 400 جم (12 قطعة)', conversion_factor: 12, selling_price: 285.00, barcode: '6223000760215C' }]
  },
  {
    barcode: '6223000057704',
    name: 'حلاوة طحينية الرشيدي المزان 1 كيلو',
    category: 'لبان وحلويات وبسكويت',
    brand: 'الرشيدي المزان',
    unit: 'قطعة',
    purchase_price: 45.00,
    selling_price: 55.00,
    wholesale_price: 50.00,
    min_price: 52.00,
    min_stock_alert: 10
  },
  {
    barcode: '6223000055618',
    name: 'حلاوة طحينية صغيرة 200 جم',
    category: 'لبان وحلويات وبسكويت',
    brand: 'الرشيدي المزان',
    unit: 'قطعة',
    purchase_price: 15.00,
    selling_price: 18.00,
    wholesale_price: 16.00,
    min_price: 17.00,
    min_stock_alert: 24
  },
  {
    barcode: '6223000057728',
    name: 'حلاوة بالمكسرات والفستق 400 جم',
    category: 'لبان وحلويات وبسكويت',
    brand: 'الرشيدي المزان',
    unit: 'قطعة',
    purchase_price: 25.00,
    selling_price: 32.00,
    wholesale_price: 28.00,
    min_price: 30.00,
    min_stock_alert: 15
  },
  {
    barcode: '6223000057742',
    name: 'حلاوة بالشوكولاتة 400 جم',
    category: 'لبان وحلويات وبسكويت',
    brand: 'الرشيدي المزان',
    unit: 'قطعة',
    purchase_price: 25.00,
    selling_price: 32.00,
    wholesale_price: 28.00,
    min_price: 30.00,
    min_stock_alert: 15
  },

  // =========================================================================
  // 24. بسكويت إكسترا مصر وبسكويت متنوع محلي
  // =========================================================================
  {
    barcode: '6222001180602',
    name: 'بسكويت شعبي شمام مصري متنوع بسكو مصر',
    category: 'لبان وحلويات وبسكويت',
    brand: 'بسكو مصر',
    unit: 'قطعة',
    purchase_price: 4.00,
    selling_price: 5.00,
    wholesale_price: 4.50,
    min_price: 4.80,
    min_stock_alert: 60
  },
  {
    barcode: '6222001150094',
    name: 'بسكويت ميكادو عصي بالشوكولاتة',
    category: 'لبان وحلويات وبسكويت',
    brand: 'بسكو مصر',
    unit: 'قطعة',
    purchase_price: 6.00,
    selling_price: 8.00,
    wholesale_price: 7.00,
    min_price: 7.50,
    min_stock_alert: 48
  },
  {
    barcode: '6222024101901',
    name: 'بسكويت أكيلا ألكر مغطى بالشوكولاتة',
    category: 'لبان وحلويات وبسكويت',
    brand: 'ألكر',
    unit: 'قطعة',
    purchase_price: 12.00,
    selling_price: 15.00,
    wholesale_price: 13.50,
    min_price: 14.00,
    min_stock_alert: 30
  },

  // =========================================================================
  // 25. كيك شيف وديريم مصر
  // =========================================================================
  {
    barcode: '6223001085416',
    name: 'كيك شيف كيك كريمة ديريم مصر',
    category: 'لبان وحلويات وبسكويت',
    brand: 'ديريم',
    unit: 'قطعة',
    purchase_price: 6.00,
    selling_price: 8.00,
    wholesale_price: 7.00,
    min_price: 7.50,
    min_stock_alert: 48
  },
  {
    barcode: '6223003942946',
    name: 'شوكولاتة طبخ ديريم 100 جم',
    category: 'لبان وحلويات وبسكويت',
    brand: 'ديريم',
    unit: 'قطعة',
    purchase_price: 15.00,
    selling_price: 20.00,
    wholesale_price: 17.00,
    min_price: 18.00,
    min_stock_alert: 20
  },

  // =========================================================================
  // 26. مستلزمات وحلويات إضافية
  // =========================================================================
  {
    barcode: '6224003479067',
    name: 'بسكويت ميجا كراميل وشوكولاتة',
    category: 'لبان وحلويات وبسكويت',
    brand: 'ميجا',
    unit: 'قطعة',
    purchase_price: 10.00,
    selling_price: 13.00,
    wholesale_price: 11.50,
    min_price: 12.00,
    min_stock_alert: 30
  },
  {
    barcode: '6221073008050',
    name: 'كورونا نيسكو مشروب شوكولاتة حليب',
    category: 'لبان وحلويات وبسكويت',
    brand: 'كورونا',
    unit: 'قطعة',
    purchase_price: 18.00,
    selling_price: 23.00,
    wholesale_price: 20.00,
    min_price: 21.00,
    min_stock_alert: 20
  },
  {
    barcode: '6221073000016',
    name: 'كورونا بودرة شوكولاتة للشرب 200 جم',
    category: 'لبان وحلويات وبسكويت',
    brand: 'كورونا',
    unit: 'قطعة',
    purchase_price: 30.00,
    selling_price: 38.00,
    wholesale_price: 34.00,
    min_price: 36.00,
    min_stock_alert: 15
  },
  {
    barcode: '6221073012101',
    name: 'كورونا شوكولاتة داكنة للطبخ 100 جم',
    category: 'لبان وحلويات وبسكويت',
    brand: 'كورونا',
    unit: 'قطعة',
    purchase_price: 20.00,
    selling_price: 27.00,
    wholesale_price: 23.00,
    min_price: 25.00,
    min_stock_alert: 15
  }
];
