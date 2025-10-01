import axios from 'axios';

export class Whois {
  async lookup(target: string): Promise<any> {
    try {
      if (this.isIpAddress(target)) {
        return await this.lookupIp(target);
      } else {
        return await this.lookupDomain(target);
      }
    } catch (error) {
      return { error: `WHOIS lookup failed: ${error}` };
    }
  }

  private isIpAddress(target: string): boolean {
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    return ipRegex.test(target);
  }

  private async lookupIp(ip: string): Promise<any> {
    try {
      const response = await axios.get(`http://ip-api.com/json/${ip}`, { timeout: 10000 });
      const data = response.data;

      const asParts = data.as ? data.as.split(' ') : [];
      const asn = asParts[0] || null;
      const asnDescription = asParts.slice(1).join(' ') || null;

      return {
        ip: ip,
        asn: asn,
        asn_cidr: null,
        asn_country_code: data.countryCode,
        asn_date: null,
        asn_description: asnDescription,
        asn_registry: null,
        nets: null,
        raw: JSON.stringify({
          domain_name: null,
          registrar: null,
          registrar_url: null,
          reseller: null,
          whois_server: null,
          referral_url: null,
          updated_date: null,
          creation_date: null,
          expiration_date: null,
          name_servers: null,
          status: data.status,
          emails: data.status === 'success' ? ['abuse@iana.org'] : null,
          dnssec: null,
          name: null,
          org: data.org,
          address: null,
          city: data.city,
          state: data.regionName,
          registrant_postal_code: data.zip,
          country: data.country
        })
      };
    } catch (error) {
      return { error: `IP WHOIS lookup failed: ${error}` };
    }
  }

  private async lookupDomain(domain: string): Promise<any> {
    try {
      const response = await axios.get(`https://api.domainsdb.info/v1/domains/search?domain=${domain}`, { timeout: 10000 });
      const data = response.data;

      if (data.domains && data.domains.length > 0) {
        const domainInfo = data.domains[0];
        return {
          domain: domain,
          registrar: domainInfo.registrar || 'Unknown',
          creation_date: domainInfo.creation_date || null,
          expiration_date: domainInfo.expiration_date || null,
          updated_date: domainInfo.updated_date || null,
          name_servers: domainInfo.name_servers || null,
          status: domainInfo.status || 'Unknown',
          raw: JSON.stringify(domainInfo)
        };
      } else {
        return {
          domain: domain,
          registrar: 'Unknown',
          creation_date: null,
          expiration_date: null,
          updated_date: null,
          name_servers: null,
          status: 'Not found',
          raw: JSON.stringify({ error: 'Domain not found' })
        };
      }
    } catch (error) {
      return { error: `Domain WHOIS lookup failed: ${error}` };
    }
  }
}
