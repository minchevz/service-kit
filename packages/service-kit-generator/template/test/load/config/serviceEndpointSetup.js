/* eslint-disable no-undef */
// const INT_API = 'http://gamesmaster.int03.integration.pgt.gaia';
const INT_API = 'http://{{generated_service_name}}.int03.integration.pgt.gaia';
const PPC2_VIA_NGINX = 'https://www.jackpotjoy.ppc2.pgt01.gamesysgames.com/api/gm';
const PPC2 = 'http://{{generated_service_name}}.stg.pp2.pgt.gaia';

const is_proxied = __ENV.HTTP_PROXY || false;
const is_int = __ENV.SERVICE_ENV === 'INT' || false;

const PPC2_API = is_proxied ? PPC2 : PPC2_VIA_NGINX;

const CAS_API = is_int ? INT_API : PPC2_API;

export default CAS_API;
