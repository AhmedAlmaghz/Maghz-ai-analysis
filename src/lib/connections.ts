import type { DBConnection } from './storage';
import type { ParsedData, DataRow } from './dataParser';
import { parseTextData, buildParsedData } from './dataParser';

// Test database connection
export async function testConnection(conn: DBConnection): Promise<{ success: boolean; message: string }> {
  try {
    // For REST API
    if (conn.type === 'rest-api') {
      if (!conn.url) throw new Error('الرابط غير موجود');
      const response = await fetch(conn.url, {
        method: conn.query ? 'POST' : 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...conn.headers,
        },
        body: conn.query ? JSON.stringify({ query: conn.query }) : undefined,
      });
      
      if (!response.ok) {
        throw new Error(`خطأ HTTP: ${response.status}`);
      }
      
      return { success: true, message: 'الاتصال ناجح' };
    }
    
    // For GraphQL
    if (conn.type === 'graphql') {
      if (!conn.url) throw new Error('الرابط غير موجود');
      const response = await fetch(conn.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...conn.headers,
        },
        body: JSON.stringify({ query: '{ __typename }' }),
      });
      
      if (!response.ok) {
        throw new Error(`خطأ HTTP: ${response.status}`);
      }
      
      return { success: true, message: 'الاتصال ناجح' };
    }
    
    // For SQL databases (MySQL, PostgreSQL)
    if (conn.type === 'mysql' || conn.type === 'postgres') {
      // Note: Browser cannot directly connect to SQL databases
      // This would require a backend proxy
      return {
        success: false,
        message: 'الاتصال بقواعد بيانات SQL يتطلب خادم خلفي (backend proxy). استخدم REST API بدلاً من ذلك.',
      };
    }
    
    // For MongoDB
    if (conn.type === 'mongodb') {
      // Same as SQL - requires backend
      return {
        success: false,
        message: 'الاتصال بـ MongoDB يتطلب خادم خلفي. استخدم MongoDB Realm أو REST API.',
      };
    }
    
    return { success: false, message: 'نوع الاتصال غير مدعوم' };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'خطأ غير معروف',
    };
  }
}

// Fetch data from connection
export async function fetchDataFromConnection(conn: DBConnection): Promise<ParsedData | null> {
  try {
    if (conn.type === 'rest-api') {
      if (!conn.url) throw new Error('الرابط غير موجود');
      
      const response = await fetch(conn.url, {
        method: conn.query ? 'POST' : 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...conn.headers,
        },
        body: conn.query ? JSON.stringify({ query: conn.query }) : undefined,
      });
      
      if (!response.ok) {
        throw new Error(`خطأ HTTP: ${response.status}`);
      }
      
      const json = await response.json();
      
      // Try to normalize the response
      let rows: DataRow[] = [];
      
      if (Array.isArray(json)) {
        rows = json;
      } else if (json.data && Array.isArray(json.data)) {
        rows = json.data;
      } else if (json.results && Array.isArray(json.results)) {
        rows = json.results;
      } else if (json.items && Array.isArray(json.items)) {
        rows = json.items;
      } else {
        // Single object, wrap in array
        rows = [json];
      }
      
      if (rows.length === 0) {
        throw new Error('لم يتم العثور على بيانات');
      }
      
      return buildParsedData(rows);
    }
    
    if (conn.type === 'graphql') {
      if (!conn.url || !conn.query) throw new Error('الرابط والاستعلام مطلوبان');
      
      const response = await fetch(conn.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...conn.headers,
        },
        body: JSON.stringify({ query: conn.query }),
      });
      
      if (!response.ok) {
        throw new Error(`خطأ HTTP: ${response.status}`);
      }
      
      const json = await response.json();
      
      if (json.errors) {
        throw new Error(json.errors[0]?.message || 'خطأ GraphQL');
      }
      
      // Extract data from GraphQL response
      const data = json.data;
      let rows: DataRow[] = [];
      
      // Try to find array in response
      for (const key in data) {
        if (Array.isArray(data[key])) {
          rows = data[key];
          break;
        }
      }
      
      if (rows.length === 0 && typeof data === 'object') {
        rows = [data];
      }
      
      if (rows.length === 0) {
        throw new Error('لم يتم العثور على بيانات');
      }
      
      return buildParsedData(rows);
    }
    
    throw new Error('نوع الاتصال غير مدعوم للاستيراد المباشر');
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : 'خطأ في جلب البيانات');
  }
}

// Parse CSV text from connection
export function parseCSVFromText(text: string): ParsedData {
  return parseTextData(text);
}
