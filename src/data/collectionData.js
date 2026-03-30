export const constellationItems = [
  { key: 'aries', name: '白羊', symbol: '♈', count: 0 },
  { key: 'taurus', name: '金牛', symbol: '♉', count: 0 },
  { key: 'gemini', name: '双子', symbol: '♊', count: 3 },
  { key: 'cancer', name: '巨蟹', symbol: '♋', count: 0 },
  { key: 'leo', name: '狮子', symbol: '♌', count: 1 },
  { key: 'virgo', name: '处女', symbol: '♍', count: 0 },
  { key: 'libra', name: '天秤', symbol: '♎', count: 0 },
  { key: 'scorpio', name: '天蝎', symbol: '♏', count: 0 },
  { key: 'sagittarius', name: '射手', symbol: '♐', count: 0 },
  { key: 'capricorn', name: '摩羯', symbol: '♑', count: 0 },
  { key: 'aquarius', name: '水瓶', symbol: '♒', count: 1 },
  { key: 'pisces', name: '双鱼', symbol: '♓', count: 0 },
];

export const zodiacItems = [
  { key: 'rat', name: '子鼠', symbol: '鼠', emoji: '🐭', count: 2 },
  { key: 'ox', name: '丑牛', symbol: '牛', emoji: '🐮', count: 0 },
  { key: 'tiger', name: '寅虎', symbol: '虎', emoji: '🐯', count: 1 },
  { key: 'rabbit', name: '卯兔', symbol: '兔', emoji: '🐰', count: 0 },
  { key: 'dragon', name: '辰龙', symbol: '龙', emoji: '🐲', count: 1 },
  { key: 'snake', name: '巳蛇', symbol: '蛇', emoji: '🐍', count: 0 },
  { key: 'horse', name: '午马', symbol: '马', emoji: '🐴', count: 0 },
  { key: 'goat', name: '未羊', symbol: '羊', emoji: '🐐', count: 0 },
  { key: 'monkey', name: '申猴', symbol: '猴', emoji: '🐵', count: 0 },
  { key: 'rooster', name: '酉鸡', symbol: '鸡', emoji: '🐔', count: 1 },
  { key: 'dog', name: '戌狗', symbol: '狗', emoji: '🐶', count: 0 },
  { key: 'pig', name: '亥猪', symbol: '猪', emoji: '🐷', count: 0 },
];

export function getCollectionStats(items) {
  const unlockedKinds = items.filter((item) => item.count > 0).length;
  const totalCount = items.reduce((sum, item) => sum + item.count, 0);
  return {
    unlockedKinds,
    totalCount,
  };
}