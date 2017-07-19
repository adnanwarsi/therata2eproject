//
//  MenuTableViewCell.swift
//  RedPepper
//
//  Created by An Phan on 10/10/16.
//  Copyright © 2016 An Phan. All rights reserved.
//

import UIKit

class MenuTableViewCell: UITableViewCell {

    static let menuCellID = "menuCellID"
    
    @IBOutlet weak var itemNameLabel: UILabel!
    
    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
        let selectedBgView = UIView()
        selectedBgView.backgroundColor = UIColor.mainColor()
        selectedBackgroundView = selectedBgView
    }

    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        if selected {
            itemNameLabel.textColor = UIColor.white
        }
        else {
            itemNameLabel.textColor = UIColor.rgbColor(red: 29, green: 29, blue: 38)
        }
    }

}
