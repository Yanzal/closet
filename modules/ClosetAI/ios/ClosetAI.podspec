Pod::Spec.new do |s|
  s.name           = 'ClosetAI'
  s.version        = '1.0.0'
  s.summary        = 'On-device AI for Closet: Apple Vision subject-lift + Foundation Models.'
  s.description    = 'Native iOS module exposing Vision background removal and Foundation Models text generation.'
  s.author         = ''
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platforms      = {
    :ios => '16.4'
  }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
