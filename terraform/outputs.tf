output "instance_id" {
  description = "ID of the Bodimkarayo EC2 Docker host"
  value       = aws_instance.app_server.id
}

output "instance_public_ip" {
  description = "Static Elastic Public IP address of the Bodimkarayo server"
  value       = aws_eip.app_eip.public_ip
}

output "ssh_connection_command" {
  description = "Command to SSH into the server (replace your-key.pem if key_name was supplied)"
  value       = "ssh -i your-key.pem ubuntu@${aws_eip.app_eip.public_ip}"
}

output "frontend_url" {
  description = "Bodimkarayo User Portal URL"
  value       = "http://${aws_eip.app_eip.public_ip}:5173"
}

output "admin_url" {
  description = "Bodimkarayo Admin Portal URL"
  value       = "http://${aws_eip.app_eip.public_ip}:5174"
}

output "backend_api_url" {
  description = "Bodimkarayo Spring Boot API URL"
  value       = "http://${aws_eip.app_eip.public_ip}:4000"
}
