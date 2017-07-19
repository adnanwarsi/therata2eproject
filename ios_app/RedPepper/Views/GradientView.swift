//
//  GradientView.swift
//  RedPepper
//
//  Created by An Phan on 10/23/16.
//  Copyright © 2016 An Phan. All rights reserved.
//

import UIKit

class GradientView: UIView {

    override open class var layerClass: AnyClass {
        get{
            return CAGradientLayer.classForCoder()
        }
    }
    
    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
        let gradientLayer = self.layer as! CAGradientLayer
        gradientLayer.colors = [UIColor.clear.cgColor, UIColor.rgbaColor(red: 0, green: 0, blue: 0, alpha: 0.8).cgColor]
    }
}
