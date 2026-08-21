export const LINES = {
  yellow: {
    name: 'Yellow Line',
    color: '#FFD700',
    textColor: '#000',
    number: 2,
    from: 'Samaypur Badli',
    to: 'HUDA City Centre',
    stations: [
      'SB','RO','HK','JN','AS','AZ','MV','GN','VB','VJ','CI','KG',
      'CH','CK','ND','RJ','PI','CS','UN','LK','JL','DL','AIIMS',
      'GKP','HK2','MN','SE','QM','CT','SP','GR','AP','GW','SC','MG','IF','HU'
    ],
  },
  blue: {
    name: 'Blue Line',
    color: '#0047AB',
    textColor: '#fff',
    number: 3,
    from: 'Dwarka Sec 21',
    to: 'Noida Electronic City / Vaishali',
    stations: [
      'DW21','DW','DW10','DW11','DW12','DW13','DW14','NA','UB','UE',
      'JN2','JE','TB','SG','TG','RP','RM','MS','KH','ST','PM','RI',
      'KP','JM','RKA','NDB','RJC','BK','MPC','PP','IT','YP',
    ],
    // Both branches diverge from Yamuna Bank (YP)
    branches: [
      ['LN','NV','PV2','KD2','AV','KS','VL'],
      ['AK','MY','MVP','NT','NO15','NO16','NO18','BT','NO34','GN2','NEC'],
    ],
  },
  red: {
    name: 'Red Line',
    color: '#CC0000',
    textColor: '#fff',
    number: 1,
    from: 'Rithala',
    to: 'Shaheed Sthal',
    stations: [
      'RT','RO2','RE','PV','KO','NC','KN','KNP','IN','SH','PH','PL',
      'TB2','KGR','SR','SI','WE','JA','MA','GO','JO','SS'
    ],
  },
  green: {
    name: 'Green Line',
    color: '#008000',
    textColor: '#fff',
    number: 5,
    from: 'Inderlok',
    to: 'Brigadier Hoshiyar Singh',
    stations: [
      'INL','AS2','PC','ESI','PBE','SH2','MA2','PNS','PWW','PK','UK',
      'SU','NS','NR','ML','MI','GN3','TI','TB3','PN','BR'
    ],
  },
  violet: {
    name: 'Violet Line',
    color: '#7B00D4',
    textColor: '#fff',
    number: 6,
    from: 'Kashmere Gate',
    to: 'Raja Nahari Ka Baag',
    stations: [
      'KGV','LR','JJ','DG','IT2','MH','JN3','CS2','KH2','JL2','JP',
      'LJ','MO','KL','NZ','KK','GV','HN','JB','SN','MV2','TG2',
      'BN','SK','NHB','MV3','SC2','BM','OC','NK','CH2','ES','SR2','RN'
    ],
  },
  pink: {
    name: 'Pink Line',
    color: '#FF69B4',
    textColor: '#000',
    number: 7,
    from: 'Majlis Park',
    to: 'Shiv Vihar',
    stations: [
      'MP','AZ2','SK2','BN2','PM2','ES2','RJ2','MN2','DD','DS','VS',
      'MU','RKP','IIT','HK3','PP2','CDD','IGN','SGP','SRN','INA2',
      'AIM2','DHI','JBG','JNP','CSP','KMP','JNS','JGP','LJP','VBP',
      'ASM','SKK','MYP','TR','EB','MV4','IP','AN','KD','KC',
      'KB','EV','WE2','JF','MBP','YV','BR2','KH3','SV'
    ],
  },
  magenta: {
    name: 'Magenta Line',
    color: '#CC00AA',
    textColor: '#fff',
    number: 8,
    from: 'Janakpuri West',
    to: 'Botanical Garden',
    stations: [
      'JW','DB','DM','PL3','SR3','TM','SI2','VK','VKS','PK2','KV',
      'AA','SM','MK','PK3','SK3','CH3','PC2','HK4','IIN','SC3',
      'LJ2','VB2','KT','OK','SB2','OB','BTG'
    ],
  },
  grey: {
    name: 'Grey Line',
    color: '#808080',
    textColor: '#fff',
    number: 9,
    from: 'Dwarka',
    to: 'Najafgarh',
    stations: ['DWG','NJ','NJF'],
  },
  orange: {
    name: 'Airport Express',
    color: '#FF8C00',
    textColor: '#fff',
    number: 0,
    from: 'New Delhi',
    to: 'Dwarka Sec 21',
    stations: ['ND2','SS2','DAS','IGI','SD'],
  },
  aqua: {
    name: 'Aqua Line (NMRC)',
    color: '#00BCD4',
    textColor: '#fff',
    number: 10,
    from: 'Sector 51',
    to: 'Knowledge Park 2',
    stations: [
      'AQ_S51','AQ_S50','AQ_S78','AQ_S101','AQ_S81','AQ_NSEZ','AQ_S83',
      'AQ_S137','AQ_S142','AQ_S143','AQ_S144','AQ_S145','AQ_S146',
      'AQ_S147','AQ_S148','AQ_PCH','AQ_AL1','AQ_KP2',
    ],
  },
};

export const LINE_ORDER = ['yellow','blue','red','green','violet','pink','magenta','grey','orange','aqua'];

export const getFareByStations = (count) => {
  if (count <= 2) return 10;
  if (count <= 5) return 20;
  if (count <= 12) return 30;
  if (count <= 21) return 40;
  if (count <= 32) return 50;
  return 60;
};
