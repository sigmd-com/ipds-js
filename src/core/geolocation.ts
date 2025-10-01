import axios from 'axios';

export class Geolocation {
  private baseUrls = {
    ipapi: 'http://ip-api.com/json/',
    ipinfo: 'https://ipinfo.io/'
  };

  async lookup(ip: string, service: string = 'ipapi'): Promise<any> {
    try {
      if (service === 'ipapi') {
        return await this.lookupIpapi(ip);
      } else if (service === 'ipinfo') {
        return await this.lookupIpinfo(ip);
      } else {
        throw new Error(`Unknown service: ${service}`);
      }
    } catch (error) {
      return { error: `Geolocation lookup failed: ${error}` };
    }
  }

  private async lookupIpapi(ip: string): Promise<any> {
    const response = await axios.get(`${this.baseUrls.ipapi}${ip}`, { timeout: 10000 });
    const data = response.data;

    return {
      ip: data.query,
      country: data.country,
      country_code: data.countryCode,
      region: data.region,
      region_name: data.regionName,
      city: data.city,
      zip: data.zip,
      lat: data.lat,
      lon: data.lon,
      timezone: data.timezone,
      isp: data.isp,
      org: data.org,
      as: data.as,
      query: data.query,
      status: data.status
    };
  }

  private async lookupIpinfo(ip: string): Promise<any> {
    const response = await axios.get(`${this.baseUrls.ipinfo}${ip}/json`, { timeout: 10000 });
    const data = response.data;

    const [lat, lon] = data.loc ? data.loc.split(',').map(Number) : [null, null];

    return {
      ip: data.ip,
      hostname: data.hostname,
      city: data.city,
      region: data.region,
      country: data.country,
      loc: data.loc,
      lat: lat,
      lon: lon,
      org: data.org,
      postal: data.postal,
      timezone: data.timezone,
      anycast: data.anycast
    };
  }
}
