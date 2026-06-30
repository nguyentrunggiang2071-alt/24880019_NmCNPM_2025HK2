const ARXIV_LABELS: Record<string, string> = {
  // Computer Science
  'cs.AI': 'Trí tuệ nhân tạo',
  'cs.LG': 'Học máy',
  'cs.CL': 'Xử lý ngôn ngữ tự nhiên',
  'cs.CV': 'Thị giác máy tính',
  'cs.NE': 'Mạng nơ-ron & Tiến hóa',
  'cs.RO': 'Robot học',
  'cs.IR': 'Truy xuất thông tin',
  'cs.CR': 'Bảo mật & Mật mã',
  'cs.DB': 'Cơ sở dữ liệu',
  'cs.DC': 'Điện toán phân tán',
  'cs.DS': 'Cấu trúc dữ liệu & Giải thuật',
  'cs.HC': 'Tương tác người-máy',
  'cs.IT': 'Lý thuyết thông tin',
  'cs.MA': 'Hệ đa tác nhân',
  'cs.MM': 'Đa phương tiện',
  'cs.NI': 'Mạng máy tính',
  'cs.PL': 'Ngôn ngữ lập trình',
  'cs.SE': 'Kỹ thuật phần mềm',
  'cs.SY': 'Hệ thống & Điều khiển',
  'cs.GT': 'Lý thuyết trò chơi',
  'cs.GR': 'Đồ họa máy tính',
  'cs.NA': 'Phân tích số',
  'cs.OS': 'Hệ điều hành',
  'cs.AR': 'Kiến trúc phần cứng',
  'cs.ET': 'Máy tính mới nổi',
  'cs.FL': 'Ngôn ngữ hình thức & Automata',
  'cs.LO': 'Logic trong khoa học máy tính',
  'cs.MS': 'Phần mềm toán học',
  'cs.PF': 'Hiệu năng',
  'cs.SC': 'Phần mềm toán học',
  // Statistics
  'stat.ML': 'Học máy (Thống kê)',
  'stat.TH': 'Lý thuyết thống kê',
  'stat.AP': 'Ứng dụng thống kê',
  'stat.CO': 'Tính toán thống kê',
  'stat.ME': 'Phương pháp luận thống kê',
  // Electrical Engineering
  'eess.IV': 'Xử lý ảnh & Video',
  'eess.SP': 'Xử lý tín hiệu',
  'eess.AS': 'Âm thanh & Giọng nói',
  'eess.SY': 'Hệ thống & Điều khiển',
  // Mathematics
  'math.ST': 'Thống kê toán học',
  'math.OC': 'Tối ưu hóa & Điều khiển',
  'math.PR': 'Xác suất',
  'math.NA': 'Phân tích số',
  // Physics & Bio
  'physics.data-an': 'Phân tích dữ liệu',
  'q-bio.NC': 'Khoa học thần kinh định lượng',
  'q-fin.ST': 'Thống kê tài chính',
};

export function getCategoryLabel(tag: string): string {
  return ARXIV_LABELS[tag] ?? tag;
}
