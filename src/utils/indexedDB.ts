export class IndexedDB {
  private dbName: string
  private dbVersion: number
  private storeName: string
  private db: IDBDatabase | null = null
  private keyPath: string | null
  private useInlineKeys: boolean

  constructor(dbName: string, storeName: string, options: { keyPath?: string | null, useInlineKeys?: boolean } = {}) {
    this.dbName = dbName
    this.dbVersion = 1
    this.storeName = storeName
    this.keyPath = options.keyPath || null
    this.useInlineKeys = options.useInlineKeys !== false // 默认使用内联键
  }

  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        resolve(this.db)
        return
      }

      console.log(`打开数据库: ${this.dbName}, 存储: ${this.storeName}, 键路径: ${this.keyPath}, 使用内联键: ${this.useInlineKeys}`)
      
      // 检查数据库是否已存在
      const checkRequest = indexedDB.open(this.dbName)
      checkRequest.onsuccess = () => {
        const existingDb = checkRequest.result
        const storeExists = existingDb.objectStoreNames.contains(this.storeName)
        const currentVersion = existingDb.version
        existingDb.close()
        
        // 如果存储已存在且这是一个新的实例，可能需要删除现有数据库
        if (storeExists) {
          console.log('存储已存在，使用现有数据库结构')
          const request = indexedDB.open(this.dbName)
          
          request.onerror = (event) => {
            console.error('打开数据库失败:', event)
            reject(request.error)
          }
          
          request.onsuccess = () => {
            console.log('数据库打开成功')
            this.db = request.result
            resolve(this.db)
          }
        } else {
          // 存储不存在，创建新版本
          console.log(`存储不存在，创建新数据库版本 ${currentVersion + 1}`)
          const request = indexedDB.open(this.dbName, currentVersion + 1)
          
          request.onerror = (event) => {
            console.error('打开数据库失败:', event)
            reject(request.error)
          }
          
          request.onsuccess = () => {
            console.log('数据库打开成功')
            this.db = request.result
            resolve(this.db)
          }
          
          request.onupgradeneeded = (event) => {
            console.log('数据库升级')
            const db = (event.target as IDBOpenDBRequest).result
            if (!db.objectStoreNames.contains(this.storeName)) {
              let options = {}
              if (this.useInlineKeys && this.keyPath) {
                // 使用内联键（对象中的字段作为键）
                options = { keyPath: this.keyPath }
                console.log(`创建存储 ${this.storeName}，使用内联键 keyPath=${this.keyPath}`)
              } else {
                // 使用外部键
                console.log(`创建存储 ${this.storeName}，使用外部键`)
              }
              db.createObjectStore(this.storeName, options)
            }
          }
        }
      }
      
      checkRequest.onerror = (event) => {
        console.error('检查数据库失败:', event)
        reject(checkRequest.error)
      }
    })
  }

  // 删除数据库
  async deleteDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close()
        this.db = null
      }
      
      const request = indexedDB.deleteDatabase(this.dbName)
      
      request.onsuccess = () => {
        console.log(`成功删除数据库 ${this.dbName}`)
        resolve()
      }
      
      request.onerror = (event) => {
        console.error(`删除数据库失败 ${this.dbName}:`, event)
        reject(request.error)
      }
    })
  }

  async getAll(): Promise<any[]> {
    const db = await this.openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.getAll()

      request.onerror = (event) => {
        console.error('获取所有记录失败:', event)
        reject(request.error)
      }
      
      request.onsuccess = () => {
        console.log(`获取到 ${request.result.length} 条记录`)
        resolve(request.result)
      }
    })
  }

  async get(key: string): Promise<any> {
    const db = await this.openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.get(key)

      request.onerror = (event) => {
        console.error(`获取记录失败, key=${key}:`, event)
        reject(request.error)
      }
      
      request.onsuccess = () => {
        console.log(`获取记录, key=${key}, 结果:`, request.result ? '找到' : '未找到')
        resolve(request.result)
      }
    })
  }

  async put(value: any, key?: string): Promise<void> {
    const db = await this.openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite')
      const store = transaction.objectStore(this.storeName)
      
      let request
      
      // 首先检查存储区的键路径
      const keyPath = store.keyPath
      console.log(`存储区 ${this.storeName} 的键路径:`, keyPath)
      
      if (keyPath) {
        // 使用内联键
        console.log('使用内联键存储数据:', value)
        if (typeof keyPath === 'string' && !value[keyPath]) {
          console.error(`值中缺少键路径 ${keyPath}`)
          return reject(new Error(`值中缺少键路径 ${keyPath}`))
        }
        request = store.put(value)
      } else if (key) {
        // 使用外部键
        console.log(`使用外部键 ${key} 存储数据:`, value)
        request = store.put(value, key)
      } else if (this.keyPath && value[this.keyPath]) {
        // 尝试使用配置的键路径作为外部键
        const extractedKey = value[this.keyPath]
        console.log(`使用提取的键 ${extractedKey} 存储数据:`, value)
        request = store.put(value, extractedKey)
      } else {
        console.error('没有提供键，且无法从值中提取键')
        return reject(new Error('没有提供键，且无法从值中提取键'))
      }

      request.onerror = (event) => {
        console.error('存储数据失败:', event)
        console.error('错误详情:', request.error)
        reject(request.error)
      }
      
      request.onsuccess = () => {
        console.log('数据存储成功')
        resolve()
      }
    })
  }

  async add(value: any, key?: string): Promise<any> {
    const db = await this.openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite')
      const store = transaction.objectStore(this.storeName)
      
      let request
      
      // 首先检查存储区的键路径
      const keyPath = store.keyPath
      console.log(`存储区 ${this.storeName} 的键路径:`, keyPath)
      
      if (keyPath) {
        // 使用内联键
        console.log('使用内联键添加数据:', value)
        if (typeof keyPath === 'string' && !value[keyPath]) {
          console.error(`值中缺少键路径 ${keyPath}`)
          return reject(new Error(`值中缺少键路径 ${keyPath}`))
        }
        request = store.add(value)
      } else if (key) {
        // 使用外部键
        console.log(`使用外部键 ${key} 添加数据:`, value)
        request = store.add(value, key)
      } else if (this.keyPath && value[this.keyPath]) {
        // 尝试使用配置的键路径作为外部键
        const extractedKey = value[this.keyPath]
        console.log(`使用提取的键 ${extractedKey} 添加数据:`, value)
        request = store.add(value, extractedKey)
      } else {
        console.error('没有提供键，且无法从值中提取键')
        return reject(new Error('没有提供键，且无法从值中提取键'))
      }

      request.onerror = (event) => {
        console.error('添加数据失败:', event)
        console.error('错误详情:', request.error)
        reject(request.error)
      }
      
      request.onsuccess = () => {
        console.log('数据添加成功, 结果:', request.result)
        resolve(request.result)
      }
    })
  }

  async bulkPut(items: any[]): Promise<void> {
    const db = await this.openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite')
      const store = transaction.objectStore(this.storeName)
      
      // 首先检查存储区的键路径
      const keyPath = store.keyPath
      console.log(`批量存储 ${items.length} 条记录, 存储区键路径:`, keyPath)
      
      let completed = 0
      let errors: any[] = []

      for (const item of items) {
        let request
        
        if (keyPath) {
          // 使用内联键
          if (typeof keyPath === 'string' && !item[keyPath]) {
            console.warn(`跳过没有键路径 ${keyPath} 的项目:`, item)
            completed++
            continue // 跳过没有键的项目
          }
          request = store.put(item)
        } else if (this.keyPath && item[this.keyPath]) {
          // 使用外部键（从项目中提取键）
          const key = item[this.keyPath]
          request = store.put(item, key)
        } else {
          // 没有键，记录错误并继续
          console.warn('没有为项目提供键，跳过:', item)
          completed++
          continue
        }
        
        request.onerror = (e) => { 
          console.error('存储项目失败:', e)
          errors.push(e)
          completed++
          
          if (completed === items.length) {
            if (errors.length > 0) {
              console.error(`${errors.length} 条记录存储失败`)
              reject(errors[0])
            } else {
              console.log(`成功存储所有 ${items.length} 条记录`)
              resolve()
            }
          }
        }
        
        request.onsuccess = () => {
          completed++
          if (completed === items.length) {
            if (errors.length > 0) {
              console.error(`${errors.length} 条记录存储失败`)
              reject(errors[0])
            } else {
              console.log(`成功存储所有 ${items.length} 条记录`)
              resolve()
            }
          }
        }
      }

      // 处理空数组情况
      if (items.length === 0) {
        resolve()
      }

      transaction.onerror = (event) => {
        console.error('事务失败:', event)
        reject(transaction.error)
      }
    })
  }

  async delete(key: string): Promise<void> {
    const db = await this.openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.delete(key)

      request.onerror = (event) => {
        console.error(`删除记录失败, key=${key}:`, event)
        reject(request.error)
      }
      
      request.onsuccess = () => {
        console.log(`成功删除记录, key=${key}`)
        resolve()
      }
    })
  }

  async clear(): Promise<void> {
    const db = await this.openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.clear()

      request.onerror = (event) => {
        console.error('清空存储失败:', event)
        reject(request.error)
      }
      
      request.onsuccess = () => {
        console.log('成功清空存储')
        resolve()
      }
    })
  }
} 