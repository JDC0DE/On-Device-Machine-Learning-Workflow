import xml.etree.ElementTree as xml
import os
import glob
# PATH ./project-5-at-2023-03-14-03-12-92d31ec0/train/*.xml
# PATH ./project-6-at-2023-04-30-00-12-74270469/{train or validate}/*.xml


def xml_update_name(path: str):
    for xml_file in glob.glob(path):
        og_file = xml.parse(xml_file)
        root = og_file.getroot()
        for name in root.iter('name'):
            if name.text == "green apple":
                name.text = "green_apple"
            elif name.text == "red apple":
                name.text = "red_apple"

        og_file.write(xml_file)


def xml_update_folder(path: str, folder_name: str):
    for xml_file in glob.glob(path):
        og_file = xml.parse(xml_file)
        root = og_file.getroot()
        for folder in root.iter('folder'):
            folder.text = folder_name

        og_file.write(xml_file)


if __name__ == "__main__":
    user_input = input(
        "What needs to be updated in the XML - Folder or Name? ")
    if (user_input == "update_folder"):
        user_input_path = input("PATH to directory with /*.xml ")
        user_input_folder_name = input("Folder name ")
        xml_update_folder(user_input_path, user_input_folder_name)
    elif (user_input == "update_name"):
        user_input_path = input("PATH to directory with /*.xml ")
        xml_update_name(user_input_path)
    else:
        print("Sorry either the command is wrong or the script does not currently function for that command")
