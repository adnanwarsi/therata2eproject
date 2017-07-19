//
//  PickerView.swift
//  RedPepper
//
//  Created by An Phan on 10/14/16.
//  Copyright © 2016 An Phan. All rights reserved.
//

import UIKit

protocol PickerViewDelegate {
    func pickerView(pickerView: PickerView, selectedValue: AnyObject)
}

class PickerView: UIView {

    var textField: UITextField?
    var values = [String]()
    var selectedValue = ""
    var didSelectedValue: ((String) -> Void)?
    
    @IBOutlet weak var pickerView: UIPickerView!
    @IBOutlet weak var titleLabel: UILabel!
    
    func reloadPicker() {
        for (index, value) in values.enumerated() {
            if selectedValue == value {
                pickerView.selectRow(index, inComponent: 0, animated: false)
                break
            }
        }
    }
    
    @IBAction func cancelButtonDidTouched(_ sender: UIButton) {
        textField?.resignFirstResponder()
    }
    
    @IBAction func doneButtonDidTouched(_ sender: UIButton) {
        textField?.resignFirstResponder()
        didSelectedValue?(selectedValue)
    }
}

// MARK: - UIPickerViewDataSource

extension PickerView: UIPickerViewDataSource {
    func numberOfComponents(in pickerView: UIPickerView) -> Int {
        return 1
    }
    
    func pickerView(_ pickerView: UIPickerView, numberOfRowsInComponent component: Int) -> Int {
        return values.count
    }
}

// MARK: - UIPickerViewDelegate

extension PickerView: UIPickerViewDelegate {
    func pickerView(_ pickerView: UIPickerView, titleForRow row: Int,
                    forComponent component: Int) -> String? {
        return values[row]
    }
    
    func pickerView(_ pickerView: UIPickerView, didSelectRow row: Int,
                    inComponent component: Int) {
        selectedValue = values[row]
    }
}
