//
//  AccountTableViewCell.swift
//  RedPepper
//
//  Created by An Phan on 10/11/16.
//  Copyright © 2016 An Phan. All rights reserved.
//

import UIKit

class AccountTableViewCell: UITableViewCell {
    static let cellID = "AccountTableViewCell"
    
    @IBOutlet weak var titleLabel: UILabel!
    @IBOutlet weak var textField: UITextField!
    
    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }

    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }

}
