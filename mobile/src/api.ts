import * as SecureStore from 'expo-secure-store';
const API_URL=process.env.EXPO_PUBLIC_API_URL||'http://10.0.2.2:4000/api';
export async function api<T>(path:string,options:RequestInit={}){
 const token=await SecureStore.getItemAsync('token');
 const response=await fetch(API_URL+path,{...options,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{}),...options.headers}});
 const body=response.status===204?null:await response.json().catch(()=>({message:'Phản hồi không hợp lệ'}));
 if(!response.ok)throw new Error(body?.message||'Không thể kết nối máy chủ'); return body as T;
}
export const money=(v:string|number)=>new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND',maximumFractionDigits:0}).format(Number(v));
export const monthKey=(d=new Date())=>d.toISOString().slice(0,7);
