import os
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors

def generate_exam_header(
    output_file,
    logo_path,
    exam_title,
    filiere,
    year,
    duration,
    nom="",
    prenom="",
    cne="",
    num_exam="",
    include_logo=True,
    prof_name="Dr. Name Surname",
    school_name="SUPMTI"
):
    c = canvas.Canvas(output_file, pagesize=A4)
    width, height = A4
    
    font_bold = "Helvetica-Bold"
    font_normal = "Helvetica"
    font_italic = "Helvetica-Oblique"
    
    left_margin = 20 * mm
    right_margin = width - 20 * mm
    top_y = height - 25 * mm
    
    # 1. Circle Logo
    circle_radius = 12 * mm
    circle_x = left_margin + circle_radius
    circle_y = top_y - circle_radius
    
    c.setFillColor(colors.black)
    c.circle(circle_x, circle_y, circle_radius, fill=1, stroke=0)
    
    c.setFillColor(colors.white)
    c.setFont(font_bold, 22)
    # y-offset to visually center the "S" inside the circle
    c.drawCentredString(circle_x, circle_y - 3 * mm, "S")
    
    # 2. Titles
    c.setFillColor(colors.black)
    text_x = left_margin + (2 * circle_radius) + 8 * mm
    
    c.setFont(font_bold, 24)
    c.drawString(text_x, top_y - 12 * mm, school_name)
    
    c.setFont(font_italic, 14)
    c.setFillColor(colors.darkgrey)
    c.drawString(text_x, top_y - 20 * mm, exam_title)
    
    # 3. Grid area
    c.setFillColor(colors.black)
    grid_y_start = top_y - 40 * mm
    row_height = 10 * mm
    
    col1_start = left_margin
    col1_end = width / 2 - 5 * mm
    col2_start = width / 2 + 5 * mm
    col2_end = right_margin
    
    def draw_grid_row(y, label1, val1, label2, val2):
        c.setFillColor(colors.black)
        c.setFont(font_bold, 10)
        c.drawString(col1_start, y, label1)
        c.drawString(col2_start, y, label2)
        
        c.setFont(font_normal, 10)
        c.drawRightString(col1_end, y, val1)
        c.drawRightString(col2_end, y, val2)
        
        # Dotted lines
        l1_width = c.stringWidth(label1, font_bold, 10)
        v1_width = c.stringWidth(val1, font_normal, 10)
        l2_width = c.stringWidth(label2, font_bold, 10)
        v2_width = c.stringWidth(val2, font_normal, 10)
        
        c.setDash(1, 2)
        c.setLineWidth(0.5)
        c.setStrokeColor(colors.gray)
        
        # Line 1
        x1_start = col1_start + l1_width + 3 * mm
        x1_end = col1_end - v1_width - 3 * mm
        if x1_end > x1_start:
            c.line(x1_start, y + 1 * mm, x1_end, y + 1 * mm)
        
        # Line 2
        x2_start = col2_start + l2_width + 3 * mm
        x2_end = col2_end - v2_width - 3 * mm
        if x2_end > x2_start:
            c.line(x2_start, y + 1 * mm, x2_end, y + 1 * mm)
            
        c.setDash()
        c.setStrokeColor(colors.black)
    
    # Row 1
    draw_grid_row(grid_y_start, "Course:", str(filiere), "Professor:", str(prof_name))
    
    # Row 2
    draw_grid_row(grid_y_start - row_height, "Date:", str(year), "Duration:", str(duration))
    
    # 4. Bottom Separator Line
    line_y = grid_y_start - row_height - 10 * mm
    c.setLineWidth(1)
    c.line(left_margin, line_y, right_margin, line_y)
    
    c.showPage()
    c.save()

if __name__ == "__main__":
    generate_exam_header(
        output_file="exam_header_exact.pdf",
        logo_path="",
        exam_title="Final Exam",
        filiere="Computer Science 101",
        year="2024-2025",
        duration="2h",
        prof_name="Dr. Name Surname",
        school_name="SUPMTI"
    )
    print("exam_header_exact.pdf generated!")
