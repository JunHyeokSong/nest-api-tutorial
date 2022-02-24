export function logRequest(requestType:string, domain:string, dto: any) : void {
    console.log('[REQUEST]', requestType, domain, ': ',dto);
}