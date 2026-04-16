// Database Manager menggunakan IndexedDB untuk penyimpanan offline
class DatabaseManager {
    constructor() {
        this.dbName = 'AbsensiJurnalDB';
        this.dbVersion = 1;
        this.db = null;
    }

    // Inisialisasi database
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = (event) => {
                console.error('Database error:', event.target.error);
                reject(event.target.error);
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('Database initialized successfully');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Object Store untuk Siswa
                if (!db.objectStoreNames.contains('siswa')) {
                    const siswaStore = db.createObjectStore('siswa', { keyPath: 'nis' });
                    siswaStore.createIndex('nama', 'nama', { unique: false });
                    siswaStore.createIndex('kelas', 'kelas', { unique: false });
                }

                // Object Store untuk Absensi
                if (!db.objectStoreNames.contains('absensi')) {
                    const absensiStore = db.createObjectStore('absensi', { keyPath: 'id', autoIncrement: true });
                    absensiStore.createIndex('tanggal', 'tanggal', { unique: false });
                    absensiStore.createIndex('kelas', 'kelas', { unique: false });
                    absensiStore.createIndex('mapel', 'mapel', { unique: false });
                }

                // Object Store untuk Jurnal
                if (!db.objectStoreNames.contains('jurnal')) {
                    const jurnalStore = db.createObjectStore('jurnal', { keyPath: 'id', autoIncrement: true });
                    jurnalStore.createIndex('tanggal', 'tanggal', { unique: false });
                    jurnalStore.createIndex('kelas', 'kelas', { unique: false });
                    jurnalStore.createIndex('mapel', 'mapel', { unique: false });
                }

                // Object Store untuk Data Guru
                if (!db.objectStoreNames.contains('guru')) {
                    db.createObjectStore('guru', { keyPath: 'id' });
                }

                // Object Store untuk Settings
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }
            };
        });
    }

    // CRUD Operations untuk Siswa
    async addSiswa(siswa) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['siswa'], 'readwrite');
            const store = transaction.objectStore('siswa');
            const request = store.add(siswa);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllSiswa() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['siswa'], 'readonly');
            const store = transaction.objectStore('siswa');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getSiswaByKelas(kelas) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['siswa'], 'readonly');
            const store = transaction.objectStore('siswa');
            const index = store.index('kelas');
            const request = index.getAll(kelas);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async updateSiswa(siswa) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['siswa'], 'readwrite');
            const store = transaction.objectStore('siswa');
            const request = store.put(siswa);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async deleteSiswa(nis) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['siswa'], 'readwrite');
            const store = transaction.objectStore('siswa');
            const request = store.delete(nis);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // CRUD Operations untuk Absensi
    async addAbsensi(absensi) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['absensi'], 'readwrite');
            const store = transaction.objectStore('absensi');
            const request = store.add(absensi);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAbsensiByFilter(filters) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['absensi'], 'readonly');
            const store = transaction.objectStore('absensi');
            const request = store.getAll();

            request.onsuccess = () => {
                let results = request.result;
                
                // Filter berdasarkan kriteria
                if (filters.tanggal) {
                    results = results.filter(item => item.tanggal === filters.tanggal);
                }
                if (filters.kelas) {
                    results = results.filter(item => item.kelas === filters.kelas);
                }
                if (filters.mapel) {
                    results = results.filter(item => item.mapel === filters.mapel);
                }
                if (filters.dari && filters.sampai) {
                    results = results.filter(item => 
                        item.tanggal >= filters.dari && item.tanggal <= filters.sampai
                    );
                }

                resolve(results);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async getAllAbsensi() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['absensi'], 'readonly');
            const store = transaction.objectStore('absensi');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // CRUD Operations untuk Jurnal
    async addJurnal(jurnal) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['jurnal'], 'readwrite');
            const store = transaction.objectStore('jurnal');
            const request = store.add(jurnal);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getJurnalByFilter(filters) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['jurnal'], 'readonly');
            const store = transaction.objectStore('jurnal');
            const request = store.getAll();

            request.onsuccess = () => {
                let results = request.result;
                
                // Filter berdasarkan kriteria
                if (filters.tanggal) {
                    results = results.filter(item => item.tanggal === filters.tanggal);
                }
                if (filters.kelas) {
                    results = results.filter(item => item.kelas === filters.kelas);
                }
                if (filters.mapel) {
                    results = results.filter(item => item.mapel === filters.mapel);
                }
                if (filters.dari && filters.sampai) {
                    results = results.filter(item => 
                        item.tanggal >= filters.dari && item.tanggal <= filters.sampai
                    );
                }

                resolve(results);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async getAllJurnal() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['jurnal'], 'readonly');
            const store = transaction.objectStore('jurnal');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // CRUD Operations untuk Data Guru
    async saveDataGuru(guru) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['guru'], 'readwrite');
            const store = transaction.objectStore('guru');
            const request = store.put({ id: 1, ...guru });

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getDataGuru() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['guru'], 'readonly');
            const store = transaction.objectStore('guru');
            const request = store.get(1);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Backup & Restore
    async backupData() {
        const data = {
            siswa: await this.getAllSiswa(),
            absensi: await this.getAllAbsensi(),
            jurnal: await this.getAllJurnal(),
            guru: await this.getDataGuru(),
            timestamp: new Date().toISOString()
        };
        return data;
    }

    async restoreData(data) {
        const transaction = this.db.transaction(['siswa', 'absensi', 'jurnal', 'guru'], 'readwrite');
        
        // Clear existing data
        transaction.objectStore('siswa').clear();
        transaction.objectStore('absensi').clear();
        transaction.objectStore('jurnal').clear();
        transaction.objectStore('guru').clear();

        // Restore siswa
        if (data.siswa) {
            for (const siswa of data.siswa) {
                transaction.objectStore('siswa').add(siswa);
            }
        }

        // Restore absensi
        if (data.absensi) {
            for (const absensi of data.absensi) {
                transaction.objectStore('absensi').add(absensi);
            }
        }

        // Restore jurnal
        if (data.jurnal) {
            for (const jurnal of data.jurnal) {
                transaction.objectStore('jurnal').add(jurnal);
            }
        }

        // Restore guru
        if (data.guru) {
            transaction.objectStore('guru').put(data.guru);
        }

        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }

    // Clear all data
    async clearAllData() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['siswa', 'absensi', 'jurnal', 'guru'], 'readwrite');
            
            transaction.objectStore('siswa').clear();
            transaction.objectStore('absensi').clear();
            transaction.objectStore('jurnal').clear();
            transaction.objectStore('guru').clear();

            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }

    // Get storage usage
    async getStorageUsage() {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            const estimate = await navigator.storage.estimate();
            return {
                used: estimate.usage,
                quota: estimate.quota
            };
        }
        return { used: 0, quota: 0 };
    }
}

// Export instance
const db = new DatabaseManager();
