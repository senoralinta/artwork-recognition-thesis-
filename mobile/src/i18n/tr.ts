// Turkish interface texts. These are data, not code comments.
export const tr = {
  appName: "Eser Tanıma",
  auth: {
    loginTitle: "Giriş Yap",
    registerTitle: "Hesap Oluştur",
    name: "Ad Soyad",
    email: "E-posta",
    password: "Şifre",
    loginButton: "Giriş Yap",
    registerButton: "Kayıt Ol",
    noAccount: "Hesabın yok mu?",
    haveAccount: "Zaten hesabın var mı?",
    fillAll: "Lütfen tüm alanları doldur.",
  },
  errors: {
    network: "Sunucuya ulaşılamadı. Bağlantını ve sunucunun açık olduğunu kontrol et.",
    invalidCredentials: "E-posta ya da şifre hatalı.",
    emailTaken: "Bu e-posta ile zaten bir hesap var.",
    invalidInput: "Girdiğin bilgiler geçersiz. E-postayı ve şifre uzunluğunu kontrol et.",
    tooLarge: "Fotoğraf çok büyük.",
    server: "Sunucuda bir hata oluştu. Daha sonra tekrar dene.",
    generic: "Bir şeyler ters gitti. Tekrar dene.",
  },
  home: {
    hello: (name: string) => `Merhaba, ${name}`,
    serverStatus: "Sunucu bağlantısı",
    serverOk: "Çalışıyor",
    serverFail: "Ulaşılamıyor",
    checkAgain: "Tekrar kontrol et",
    logout: "Çıkış Yap",
  },
};

export type Translations = typeof tr;
