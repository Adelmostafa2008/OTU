using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.data;
using backend.Repos.interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Repos
{
    public class GenericRepo<T> : IGenericRepo<T> where T : class
    {
        protected readonly AppDb _db;

        public GenericRepo(AppDb db)
        {
            _db = db;
        }

        public async Task Create(T Item)
        {
            await _db.Set<T>().AddAsync(Item);
            await Save();
        }

        public async Task Delete(T item)
        {
            _db.Set<T>().Remove(item);
            await Save();
        }

        public async Task<IList<T>> GetAll()
        {
            var items = await _db.Set<T>().ToListAsync();
            return items;
        }

        public async Task<T> GetById(int id)
        {
            var item = await _db.Set<T>().FindAsync(id);
            return item;
        }

        public async Task Save()
        {
            await _db.SaveChangesAsync();
        }

        public async Task Update(T item)
        {
            _db.Set<T>().Update(item);
            await Save();
        }
    }
}