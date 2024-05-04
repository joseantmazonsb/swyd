export function remove<T>(item: T, array: T[], deleteCount: number = 1) {
  array.splice(array.indexOf(item), deleteCount)
  return array
}

export const regex = {
  ipv4: /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/,
  domainName: /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/,
  mac: /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/
}

export function toJson(formData: FormData) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const object: any = {};
  formData.forEach((value, key) => {
      // Reflect.has in favor of: object.hasOwnProperty(key)
      if(!Reflect.has(object, key)){
          object[key] = value;
          return;
      }
      if(!Array.isArray(object[key])){
          object[key] = [object[key]];    
      }
      object[key].push(value);
  });
  return object
}