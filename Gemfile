# 指定国内稳定的 RubyGems 源（解决下载慢问题）
source 'https://gems.ruby-china.com'

# Jekyll 核心依赖（4.0+ 版本，兼容 Windows）
gem "jekyll", "~> 4.4"  # 升级到 4.4 稳定版，比 4.0 兼容性更好

# 分页插件（Jekyll 官方分页功能）
gem 'jekyll-paginate'

# 辅助工具依赖
gem "rake"

# WEBrick 服务器（Ruby 3.0+ 后需手动指定，避免启动报错）
gem "webrick", "~> 1.7"

# 时区处理依赖（Windows 必装，指定兼容版本）
gem "tzinfo", "~> 2.0"
gem "tzinfo-data", "~> 1.2025"  # 最新时区数据，适配 2025 年

# 可选：添加 Windows 下的编码兼容依赖（避免中文乱码/路径问题）
gem "wdm", ">= 0.1.0" if Gem.win_platform?