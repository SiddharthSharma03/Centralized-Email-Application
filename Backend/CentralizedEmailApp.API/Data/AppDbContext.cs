using Microsoft.EntityFrameworkCore;
using CentralizedEmailApp.API.Models;

namespace CentralizedEmailApp.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<EmailLog> EmailLogs { get; set; }
        public DbSet<Application> Applications { get; set; }
        public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<EmailLog>()
                .HasOne<Application>()
                .WithMany(a => a.EmailLogs)
                .HasForeignKey(e => e.AppId)
                .HasPrincipalKey(a => a.Name);

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();
        }
    }
}