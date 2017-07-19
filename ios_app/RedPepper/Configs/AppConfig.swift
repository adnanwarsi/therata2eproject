//
//  AppConfigs.swift

import Foundation

enum BuildTarget {
    case debug, adHoc, test, release
}

struct AppConfig {
    struct ServerHosts {
        static let Local = "https://4fazgh21c4.execute-api.us-east-1.amazonaws.com/v1"
        static let Staging = "https://4fazgh21c4.execute-api.us-east-1.amazonaws.com/v1"
        static let Production = "https://4fazgh21c4.execute-api.us-east-1.amazonaws.com/v1"
    }
    
    struct ExternalURLs {
        static let about = "https://s3.amazonaws.com/genie.us.pepper.bucket/HTMLS/About.htm"
        static let privacyPolicy = "https://s3.amazonaws.com/genie.us.pepper.bucket/HTMLS/PrivacyPolicy.htm"
        static let faq = "https://s3.amazonaws.com/genie.us.pepper.bucket/HTMLS/FAQs.htm"
        static let terms = "https://s3.amazonaws.com/genie.us.pepper.bucket/HTMLS/TermsOfService.htm"
        static let placeHolderImage = "https://s3.amazonaws.com/genie.us.pepper.bucket/RecipeImages/IMAGES_SMALL/no_recipe_image.png"
        static let alexaSetupGuide = "https://s3.amazonaws.com/genie.us.pepper.bucket/HTMLS/alexa_user_id_not_setup.htm"
        static let addRecipeVideo = "https://s3.amazonaws.com/genie.us.pepper.bucket/video+_files/CutAndPaste.mp4"
        static let tutorialVideo = "https://s3.amazonaws.com/genie.us.pepper.bucket/video+_files/Tutorial.mp4"
        static let signOnVideo = "https://s3.amazonaws.com/genie.us.pepper.bucket/video+_files/FirstSignOn.mp4"
        static let addRecipeImage = "https://s3.amazonaws.com/genie.us.pepper.bucket/ImagesForVideos/CutAndPaste.jpg"
        static let tutorialImage = "https://s3.amazonaws.com/genie.us.pepper.bucket/ImagesForVideos/TutorialPage.jpg"
        static let signOnImage = "https://s3.amazonaws.com/genie.us.pepper.bucket/ImagesForVideos/FirstSignOnVid.jpg"
        static let compatibleApps = "https://s3.amazonaws.com/genie.us.pepper.bucket/HTMLS/CompatibleApps.htm"
        static let tutorialPage = "https://s3.amazonaws.com/genie.us.pepper.bucket/HTMLS/Tutorial.htm"
    }
    
    #if DEBUG
    static let buildTarget: BuildTarget = .debug
    struct Environment {
    static let hostPath: String = ServerHosts.Production
    }
    #elseif ADHOC
    static let buildTarget: BuildTarget = .adHoc
    struct Environment {
    static let hostPath = ServerHosts.Staging
    }
    #elseif RELEASE
    static let buildTarget: BuildTarget = .release
    struct Environment {
    static let hostPath = ServerHosts.Production
    static let useSSL = false
    }
    #else // Compiler Flag not set!!!
    static let buildTarget: BuildTarget = .debug
    struct Environment {
        static let hostPath = ServerHosts.Production
        static let useSSL = false
    }
    #endif
}
