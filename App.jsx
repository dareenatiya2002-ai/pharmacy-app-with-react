import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  // --- حالة البيانات (State) ---
  const [db, setDb] = useState(() => {
    const saved = localStorage.getItem('myPharmacyDB');
    return saved ? JSON.parse(saved) : { kids: [], adults: [], seniors: [], herbs: [] };
  });

  const [cart, setCart] = useState([]);
  const [activeSection, setActiveSection] = useState('home');
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userAge, setUserAge] = useState('');
  const [filteredMeds, setFilteredMeds] = useState([]);
  
  // حقول الإدارة والدفع
  const [newMed, setNewMed] = useState({ name: '', price: '', cat: 'kids', info: '' });
  const [newHerb, setNewHerb] = useState({ name: '', benefit: '', image: '' });
  const [payMethod, setPayMethod] = useState('عند الاستلام');
  const [receipt, setReceipt] = useState(null);

  // حفظ البيانات تلقائياً
  useEffect(() => {
    localStorage.setItem('myPharmacyDB', JSON.stringify(db));
  }, [db]);

  // --- الوظائف (Functions) ---
  const toggleNav = () => setIsNavOpen(!isNavOpen);
  const toggleCart = () => setIsCartOpen(!isCartOpen);

  const handleAddMed = () => {
    if (!newMed.name || !newMed.price) return alert("يرجى إكمال بيانات الدواء");
    const updatedDb = { ...db };
    updatedDb[newMed.cat].push({ ...newMed, id: Date.now() });
    setDb(updatedDb);
    alert("تمت الإضافة بنجاح ✅");
  };

  const handleAddHerb = () => {
    if (!newHerb.name || !newHerb.benefit) return alert("يرجى إكمال بيانات العشبة");
    const finalImage = newHerb.image || "https://images.unsplash.com/photo-1515555230216-820c39d439bb?w=300";
    setDb({ ...db, herbs: [...db.herbs, { ...newHerb, image: finalImage, id: Date.now() }] });
    alert("تم إضافة العشبة للدليل 🌿");
  };

  const deleteItem = (cat, id) => {
    if (window.confirm("هل أنتِ متأكدة من الحذف يا دارين؟")) {
      setDb({ ...db, [cat]: db[cat].filter(item => item.id !== id) });
    }
  };

  const searchMeds = () => {
    if (!userAge) return alert("أدخل العمر أولاً");
    const cat = userAge < 12 ? 'kids' : (userAge < 45 ? 'adults' : 'seniors');
    setFilteredMeds(db[cat]);
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
  };

  const addToCart = (name, price) => {
    setCart([...cart, { name, price: parseFloat(price) }]);
  };

  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const totalPrice = cart.reduce((acc, item) => acc + item.price, 0);

  const sendOrderWhatsApp = () => {
    if (cart.length === 0) return alert("السلة فارغة!");
    if (payMethod !== 'عند الاستلام' && !receipt) return alert("يرجى رفع صورة الإيصال أولاً!");

    let msg = `*طلب جديد - صيدلية العائلة*\n--------------------------\n`;
    cart.forEach((item, i) => msg += `${i + 1}. ${item.name} (${item.price} ₪)\n`);
    msg += `--------------------------\n💰 *المجموع:* ${totalPrice} ₪\n💳 *طريقة الدفع:* ${payMethod}`;
    
    window.open(`https://wa.me/970599967925?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="app-container" dir="rtl">
      {/* الهيدر */}
      <header className="main-header">
        <div className="header-inner">
          <div className="menu-icon" onClick={toggleNav}>
            <span></span><span></span><span></span>
          </div>
          <div className="brand-box">
            <span className="brand-icon">🏥</span>
            <h1 className="brand-name">صيدلية العائلة</h1>
          </div>
          <div className="cart-trigger" onClick={toggleCart}>
            🛒 <span className="cart-badge">{cart.length}</span>
          </div>
        </div>
      </header>

      {/* القائمة الجانبية */}
      <div className={`sidenav ${isNavOpen ? 'open' : ''}`}>
        <span className="closebtn" onClick={toggleNav}>&times;</span>
        <button onClick={() => { setActiveSection('home'); toggleNav(); }}>🏠 الرئيسية</button>
        <button onClick={() => { setActiveSection('herbs'); toggleNav(); }}>🌿 دليل الأعشاب</button>
        <button onClick={() => { setActiveSection('contact'); toggleNav(); }}>📇 اتصل بنا</button>
        <hr />
        <button onClick={() => { 
          const p = prompt("كلمة مرور الإدارة:");
          if(p === "dareen123") setIsAdmin(true);
          toggleNav();
        }}>🛡️ لوحة الإدارة</button>
      </div>

      <main className="content">
        {/* قسم الهيرو */}
        {activeSection === 'home' && (
          <section className="hero">
            <div className="hero-content">
              <h1>رعايتكم أمانة.. وصحتكم غايتنا 🌿</h1>
              <p>صيدلية العائلة - بإدارة الصيدلانية دارين أبو عاصي</p>
              <button className="btn-hero" onClick={() => document.getElementById('search-box').scrollIntoView()}>ابدأ البحث 🔍</button>
            </div>
          </section>
        )}

        {/* لوحة الإدارة */}
        {isAdmin && (
          <section className="card admin-panel">
            <h3>🛠️ لوحة تحكم دارين</h3>
            <div className="admin-grid">
              <div className="admin-box">
                <h4>💊 إضافة دواء</h4>
                <input type="text" placeholder="اسم الدواء" onChange={e => setNewMed({...newMed, name: e.target.value})} />
                <input type="number" placeholder="السعر" onChange={e => setNewMed({...newMed, price: e.target.value})} />
                <select onChange={e => setNewMed({...newMed, cat: e.target.value})}>
                  <option value="kids">أطفال</option>
                  <option value="adults">بالغين</option>
                  <option value="seniors">كبار سن</option>
                </select>
                <button className="btn-main" onClick={handleAddMed}>حفظ الدواء</button>
              </div>
              <div className="admin-box">
                <h4>🌿 إضافة عشبة</h4>
                <input type="text" placeholder="اسم العشبة" onChange={e => setNewHerb({...newHerb, name: e.target.value})} />
                <input type="text" placeholder="الفائدة" onChange={e => setNewHerb({...newHerb, benefit: e.target.value})} />
                <input type="text" placeholder="رابط الصورة" onChange={e => setNewHerb({...newHerb, image: e.target.value})} />
                <button className="btn-main green" onClick={handleAddHerb}>حفظ العشبة</button>
              </div>
            </div>
          </section>
        )}

        {/* البحث والأدوية */}
        {activeSection === 'home' && (
          <div id="search-box">
            <section className="card search-section">
              <h2>ابحثي عن الدواء المناسب</h2>
              <div className="search-bar">
                <input type="number" placeholder="أدخلي العمر هنا..." value={userAge} onChange={e => setUserAge(e.target.value)} />
                <button className="btn-main" onClick={searchMeds}>بحث</button>
              </div>
            </section>
            
            <div id="results" className="med-grid">
              {filteredMeds.map(m => (
                <div key={m.id} className="card med-card">
                  <h3>{m.name}</h3>
                  <p className="price">{m.price} ₪</p>
                  <p><small>{m.info}</small></p>
                  <button className="btn-add" onClick={() => addToCart(m.name, m.price)}>إضافة للسلة 🛒</button>
                  {isAdmin && <button className="btn-del" onClick={() => deleteItem(m.cat, m.id)}>حذف</button>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* دليل الأعشاب */}
        {activeSection === 'herbs' && (
          <div className="med-grid">
            {db.herbs.map(h => (
              <div key={h.id} className="card herb-card">
                <img src={h.image} alt={h.name} />
                <h3>{h.name}</h3>
                <p>{h.benefit}</p>
                <button className="btn-add green" onClick={() => addToCart(`عشبة: ${h.name}`, 0)}>طلب استشارة 🌿</button>
                {isAdmin && <button className="btn-del" onClick={() => deleteItem('herbs', h.id)}>حذف</button>}
              </div>
            ))}
          </div>
        )}

        {/* اتصل بنا */}
        {activeSection === 'contact' && (
          <section className="card contact-card">
            <h2>📇 تواصلِ معنا</h2>
            <div className="contact-info">
              <p>📞 <strong>جوال:</strong> 0599967925</p>
              <p>📧 <strong>إيميل:</strong> dareenatiya2002@gmail.com</p>
              <p>📍 <strong>العنوان:</strong> غزة - فلسطين</p>
            </div>
          </section>
        )}
      </main>

      {/* مودال السلة والدفع */}
      {isCartOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>🛒 سلة المشتريات</h3>
              <button onClick={toggleCart}>&times;</button>
            </div>
            <div className="modal-body">
              {cart.map((item, i) => (
                <div key={i} className="cart-item">
                  <span>{item.name}</span>
                  <span>{item.price} ₪ <button onClick={() => removeFromCart(i)}>❌</button></span>
                </div>
              ))}
              <div className="total">المجموع الإجمالي: {totalPrice} ₪</div>
              
              <div className="payment-sec">
                <h4>طريقة الدفع:</h4>
                <select onChange={(e) => setPayMethod(e.target.value)}>
                  <option value="عند الاستلام">الدفع عند الاستلام</option>
                  <option value="بال باي">محفظة PalPay</option>
                  <option value="بنك">تحويل بنكي</option>
                </select>
                {payMethod !== 'عند الاستلام' && (
                  <div className="receipt-upload">
                    <p>يرجى رفع صورة الإيصال:</p>
                    <input type="file" onChange={(e) => setReceipt(e.target.files[0])} />
                  </div>
                )}
              </div>
            </div>
            <button className="btn-confirm" onClick={sendOrderWhatsApp}>تأكيد الطلب عبر واتساب ✅</button>
          </div>
        </div>
      )}

      <footer>
        <p>© 2026 جميع الحقوق محفوظة لـ صيدلية العائلة</p>
        <p>تصميم المبرمجة: <span className="owner-name">Darren Atiya Abu Assi</span></p>
      </footer>
    </div>
  );
};

export default App;